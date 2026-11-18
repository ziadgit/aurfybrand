import type { LucideIcon } from "lucide-react";
import { FileText, Home, Layers, ListChecks, Palette, Radar, Send } from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  short: string;
  icon: LucideIcon;
  step?: number;
  description?: string;
};

export const WORKFLOW: NavItem[] = [
  { path: "/intake", label: "Merchant intake", short: "Intake", icon: FileText, step: 1, description: "Who we are approaching" },
  { path: "/signals", label: "Signals feed", short: "Signals", icon: Radar, step: 2, description: "Observed evidence" },
  { path: "/brief", label: "Merchant brief", short: "Brief", icon: Layers, step: 3, description: "Evidence, hypotheses, unknowns" },
  { path: "/positioning", label: "Positioning", short: "Angle", icon: ListChecks, step: 4, description: "One reviewed angle" },
  { path: "/concept", label: "Co-brand concept", short: "Concept", icon: Palette, step: 5, description: "Illustrative, not a claim" },
  { path: "/outreach", label: "Outreach draft", short: "Outreach", icon: Send, step: 6, description: "Copied by a human" },
  { path: "/pipeline", label: "Prospect pipeline", short: "Pipeline", icon: ListChecks, step: 7, description: "Next sales action" },
];

export const MOBILE_NAV: NavItem[] = [
  { path: "/", label: "Studio", short: "Studio", icon: Home },
  { path: "/signals", label: "Signals", short: "Signals", icon: Radar },
  { path: "/brief", label: "Brief", short: "Brief", icon: Layers },
  { path: "/concept", label: "Concept", short: "Concept", icon: Palette },
  { path: "/outreach", label: "Outreach", short: "Outreach", icon: Send },
  { path: "/pipeline", label: "Pipeline", short: "Pipeline", icon: ListChecks },
];

export function stepForPath(pathname: string): NavItem | undefined {
  return WORKFLOW.find((item) => item.path === pathname);
}
