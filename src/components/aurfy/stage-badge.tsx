import type { StageId } from "@/aurfy/types";
import { STAGES } from "@/aurfy/content";
import { Pill } from "./ui-bits";

const toneMap: Record<StageId, "neutral" | "primary" | "accent" | "success"> = {
  research: "neutral",
  concept_ready: "primary",
  outreach_sent: "accent",
  responded: "accent",
  meeting: "success",
  opportunity: "success",
};

export function StageBadge({ stage, className }: { stage: StageId; className?: string }) {
  const meta = STAGES.find((item) => item.id === stage);
  return (
    <Pill tone={toneMap[stage]} className={className}>
      {meta?.label ?? stage}
    </Pill>
  );
}
