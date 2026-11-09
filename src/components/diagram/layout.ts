/**
 * Architecture-diagram layout math, kept pure so it can be tested without
 * rendering. Nodes sit on a column/row grid; edges are cubic Bézier paths
 * between box edges.
 */

export type Point = {x: number; y: number};
export type Rect = {x: number; y: number; width: number; height: number};
export type GridArea = {x: number; y: number; width: number; height: number};

export type DiagramNodeInput = {id: string; column: number; row: number};
export type DiagramEdgeInput = {from: string; to: string; accent?: boolean};

export type LaidOutNode = {
  id: string;
  column: number;
  row: number;
  box: Rect;
};

export type LaidOutEdge = {
  from: string;
  to: string;
  accent?: boolean;
  d: string;
  start: Point;
  end: Point;
};

export type DiagramLayout = {
  columns: number;
  rows: number;
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
};

const round = (value: number): number => Math.round(value * 100) / 100;

const point = (x: number, y: number): Point => ({x: round(x), y: round(y)});

export const diagramGrid = (
  nodes: readonly DiagramNodeInput[],
): {columns: number; rows: number} => {
  if (nodes.length === 0) {
    throw new Error('diagramGrid: at least one node is required');
  }
  return {
    columns: Math.max(...nodes.map((node) => node.column)) + 1,
    rows: Math.max(...nodes.map((node) => node.row)) + 1,
  };
};

const centerY = (box: Rect): number => box.y + box.height / 2;
const centerX = (box: Rect): number => box.x + box.width / 2;

/**
 * Builds an S-curve between two boxes, choosing the side of each box that
 * faces the other one. Forward flows leave the source's right edge; backward
 * flows leave the left edge; same-column flows run vertically.
 */
export const edgeGeometry = (
  source: {box: Rect; column: number; row: number},
  target: {box: Rect; column: number; row: number},
): {d: string; start: Point; end: Point} => {
  if (target.column > source.column) {
    const start = point(source.box.x + source.box.width, centerY(source.box));
    const end = point(target.box.x, centerY(target.box));
    const bend = Math.max(40, (end.x - start.x) * 0.5);
    return {
      start,
      end,
      d: `M ${start.x} ${start.y} C ${round(start.x + bend)} ${start.y}, ${round(end.x - bend)} ${end.y}, ${end.x} ${end.y}`,
    };
  }

  if (target.column < source.column) {
    const start = point(source.box.x, centerY(source.box));
    const end = point(target.box.x + target.box.width, centerY(target.box));
    const bend = Math.max(40, (start.x - end.x) * 0.5);
    return {
      start,
      end,
      d: `M ${start.x} ${start.y} C ${round(start.x - bend)} ${start.y}, ${round(end.x + bend)} ${end.y}, ${end.x} ${end.y}`,
    };
  }

  // Same column: run vertically between the facing edges.
  if (target.row >= source.row) {
    const start = point(centerX(source.box), source.box.y + source.box.height);
    const end = point(centerX(target.box), target.box.y);
    const bend = Math.max(24, (end.y - start.y) * 0.5);
    return {
      start,
      end,
      d: `M ${start.x} ${start.y} C ${start.x} ${round(start.y + bend)}, ${end.x} ${round(end.y - bend)}, ${end.x} ${end.y}`,
    };
  }

  const start = point(centerX(source.box), source.box.y);
  const end = point(centerX(target.box), target.box.y + target.box.height);
  const bend = Math.max(24, (start.y - end.y) * 0.5);
  return {
    start,
    end,
    d: `M ${start.x} ${start.y} C ${start.x} ${round(start.y - bend)}, ${end.x} ${round(end.y + bend)}, ${end.x} ${end.y}`,
  };
};

export const layoutDiagram = ({
  nodes,
  edges,
  area,
  nodeWidth,
  nodeHeight,
}: {
  nodes: readonly DiagramNodeInput[];
  edges: readonly DiagramEdgeInput[];
  area: GridArea;
  nodeWidth: number;
  nodeHeight: number;
}): DiagramLayout => {
  if (nodes.length === 0) {
    throw new Error('layoutDiagram: at least one node is required');
  }
  if (nodeWidth <= 0 || nodeHeight <= 0) {
    throw new Error('layoutDiagram: node dimensions must be positive');
  }

  const {columns, rows} = diagramGrid(nodes);
  const columnSpan = area.width / columns;
  const rowSpan = area.height / rows;

  if (nodeWidth > columnSpan || nodeHeight > rowSpan) {
    throw new Error(
      `layoutDiagram: ${columns}×${rows} grid in ${area.width}×${area.height} cannot fit a ` +
        `${nodeWidth}×${nodeHeight} node`,
    );
  }

  const laidOutNodes: LaidOutNode[] = nodes.map((node) => ({
    id: node.id,
    column: node.column,
    row: node.row,
    box: {
      x: round(area.x + node.column * columnSpan + (columnSpan - nodeWidth) / 2),
      y: round(area.y + node.row * rowSpan + (rowSpan - nodeHeight) / 2),
      width: nodeWidth,
      height: nodeHeight,
    },
  }));

  const byId = new Map(laidOutNodes.map((node) => [node.id, node]));

  const laidOutEdges: LaidOutEdge[] = edges.map((edge, index) => {
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    if (!source || !target) {
      throw new Error(
        `layoutDiagram: edge ${index} references an unknown node ("${edge.from}" → "${edge.to}")`,
      );
    }

    return {
      from: edge.from,
      to: edge.to,
      accent: edge.accent,
      ...edgeGeometry(source, target),
    };
  });

  return {columns, rows, nodes: laidOutNodes, edges: laidOutEdges};
};
