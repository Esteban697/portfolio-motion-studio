import {describe, expect, it} from 'vitest';
import {approvalKeys, evaluateApprovals, finalRenderBlockers} from '../src/utils/approvals';

describe('evaluateApprovals', () => {
  it('treats an absent approvals object as nothing approved', () => {
    expect(evaluateApprovals(undefined)).toEqual({
      approved: [],
      missing: [...approvalKeys],
    });
  });

  it('counts only explicit true values as approved', () => {
    const state = evaluateApprovals({
      facts: true,
      script: true,
      storyboard: false,
      finalRender: false,
    });

    expect(state.approved).toEqual(['facts', 'script']);
    expect(state.missing).toEqual(['storyboard', 'finalRender']);
  });

  it('reports every gate as approved when all are true', () => {
    const state = evaluateApprovals({
      facts: true,
      script: true,
      storyboard: true,
      finalRender: true,
    });

    expect(state.missing).toEqual([]);
    expect(state.approved).toEqual([...approvalKeys]);
  });
});

describe('finalRenderBlockers', () => {
  it('blocks the final render until every gate is approved', () => {
    expect(finalRenderBlockers(undefined)).toEqual([...approvalKeys]);
    expect(
      finalRenderBlockers({facts: true, script: true, storyboard: true, finalRender: false}),
    ).toEqual(['finalRender']);
  });

  it('allows the final render once finalRender is approved', () => {
    expect(
      finalRenderBlockers({facts: true, script: true, storyboard: true, finalRender: true}),
    ).toEqual([]);
  });
});
