import type {Approvals} from '../schemas/project-schema';

/**
 * Approval gates. A gate is satisfied only by an explicit `true` in the
 * manifest — absent, false, or missing all count as unapproved.
 */
export const approvalKeys = ['facts', 'script', 'storyboard', 'finalRender'] as const;

export type ApprovalKey = (typeof approvalKeys)[number];

export const approvalLabels: Record<ApprovalKey, string> = {
  facts: 'facts',
  script: 'script',
  storyboard: 'storyboard',
  finalRender: 'final render',
};

export type ApprovalState = {
  approved: ApprovalKey[];
  missing: ApprovalKey[];
};

export const evaluateApprovals = (approvals: Approvals | undefined): ApprovalState => {
  const approved = approvalKeys.filter((key) => approvals?.[key] === true);
  const missing = approvalKeys.filter((key) => approvals?.[key] !== true);
  return {approved, missing};
};

/**
 * The production render requires every gate, including `finalRender`, which a
 * human sets only after reviewing a preview.
 */
export const finalRenderBlockers = (approvals: Approvals | undefined): ApprovalKey[] =>
  evaluateApprovals(approvals).missing;
