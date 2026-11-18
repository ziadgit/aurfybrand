import type { Brief, ConceptDraft, OutreachDraft, PipelineEntry, Positioning, Signal } from "./types";

export type ProgressInput = {
  selectedSignals: Signal[];
  brief: Brief;
  positioning: Positioning;
  concept: ConceptDraft;
  outreach: OutreachDraft;
  pipeline: PipelineEntry;
};

export function workflowProgress({
  selectedSignals,
  brief,
  positioning,
  concept,
  outreach,
  pipeline,
}: ProgressInput): Record<number, boolean> {
  return {
    1: true,
    2:
      selectedSignals.some((signal) => signal.category === "customer") &&
      selectedSignals.some((signal) => signal.category === "peer"),
    3: Boolean(brief.observed.trim()) && brief.reviewed,
    4: Boolean(positioning.angle) && positioning.capabilityIds.length > 0 && positioning.reviewed,
    5: Boolean(concept.headline.trim()) && concept.reviewed,
    6: Boolean(outreach.observation.trim() && outreach.question.trim()) && outreach.reviewed,
    7: pipeline.stage !== "research",
  };
}

export const STEP_PATHS = ["/intake", "/signals", "/brief", "/positioning", "/concept", "/outreach", "/pipeline"] as const;

export function nextIncompleteStep(done: Record<number, boolean>): { step: number; path: string } {
  for (let step = 2; step <= 7; step += 1) {
    if (!done[step]) return { step, path: STEP_PATHS[step - 1] };
  }
  return { step: 7, path: "/pipeline" };
}
