import {describe, expect, it} from 'vitest';
import {diagramGrid, layoutDiagram, type Rect} from '../src/components/diagram/layout';

const nodes = [
  {id: 'a', column: 0, row: 0},
  {id: 'b', column: 1, row: 0},
  {id: 'c', column: 1, row: 1},
  {id: 'd', column: 2, row: 0},
];

const edges = [
  {from: 'a', to: 'b'},
  {from: 'c', to: 'b'},
  {from: 'b', to: 'd', accent: true},
];

const area = {x: 140, y: 300, width: 1640, height: 500};
const options = {nodes, edges, area, nodeWidth: 200, nodeHeight: 90};

const layout = layoutDiagram(options);
const box = (id: string): Rect => {
  const node = layout.nodes.find((entry) => entry.id === id);
  if (!node) throw new Error(`missing node ${id}`);
  return node.box;
};

describe('diagramGrid', () => {
  it('derives the grid from the furthest column and row', () => {
    expect(diagramGrid(nodes)).toEqual({columns: 3, rows: 2});
  });

  it('rejects an empty diagram', () => {
    expect(() => diagramGrid([])).toThrow(/at least one node/);
  });
});

describe('layoutDiagram', () => {
  it('centres nodes inside their grid cell', () => {
    const columnSpan = area.width / 3;
    const rowSpan = area.height / 2;
    const a = box('a');

    expect(a.width).toBe(200);
    expect(a.height).toBe(90);
    expect(a.x).toBeCloseTo(area.x + (columnSpan - 200) / 2, 1);
    expect(a.y).toBeCloseTo(area.y + (rowSpan - 90) / 2, 1);
  });

  it('keeps every node fully inside the area', () => {
    for (const node of layout.nodes) {
      expect(node.box.x).toBeGreaterThanOrEqual(area.x);
      expect(node.box.y).toBeGreaterThanOrEqual(area.y);
      expect(node.box.x + node.box.width).toBeLessThanOrEqual(area.x + area.width);
      expect(node.box.y + node.box.height).toBeLessThanOrEqual(area.y + area.height);
    }
  });

  it('never overlaps two nodes', () => {
    for (let i = 0; i < layout.nodes.length; i++) {
      for (let j = i + 1; j < layout.nodes.length; j++) {
        const first = layout.nodes[i];
        const second = layout.nodes[j];
        if (!first || !second) continue;
        const overlap =
          first.box.x < second.box.x + second.box.width &&
          second.box.x < first.box.x + first.box.width &&
          first.box.y < second.box.y + second.box.height &&
          second.box.y < first.box.y + first.box.height;
        expect(overlap).toBe(false);
      }
    }
  });

  it('routes forward edges from the source right edge to the target left edge', () => {
    const edge = layout.edges[0];
    if (!edge) throw new Error('missing edge');
    const a = box('a');
    const b = box('b');

    expect(edge.start.x).toBeCloseTo(a.x + a.width, 2);
    expect(edge.start.y).toBeCloseTo(a.y + a.height / 2, 2);
    expect(edge.end.x).toBeCloseTo(b.x, 2);
    expect(edge.end.y).toBeCloseTo(b.y + b.height / 2, 2);
    expect(edge.d).toMatch(/^M [\d.]+ [\d.]+ C /);
  });

  it('routes same-column edges vertically between facing edges', () => {
    const edge = layout.edges[1];
    if (!edge) throw new Error('missing edge');
    const b = box('b');
    const c = box('c');

    expect(edge.start.x).toBeCloseTo(c.x + c.width / 2, 2);
    expect(edge.start.y).toBeCloseTo(c.y, 2);
    expect(edge.end.x).toBeCloseTo(b.x + b.width / 2, 2);
    expect(edge.end.y).toBeCloseTo(b.y + b.height, 2);
  });

  it('carries the accent flag through', () => {
    expect(layout.edges[2]?.accent).toBe(true);
  });

  it('is deterministic for the same input', () => {
    expect(layoutDiagram(options)).toEqual(layout);
  });

  it('rejects edges that reference unknown nodes', () => {
    expect(() =>
      layoutDiagram({...options, edges: [{from: 'a', to: 'nope'}]}),
    ).toThrow(/unknown node/);
  });

  it('rejects grids that cannot fit the node size', () => {
    expect(() =>
      layoutDiagram({...options, nodeWidth: 600, nodeHeight: 90}),
    ).toThrow(/cannot fit/);
  });
});
