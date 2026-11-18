import type { AngleId, Capability, ConceptPaletteId, StageId } from "./types";

export const ANGLES: {
  id: AngleId;
  label: string;
  short: string;
  lead: string;
  rationale: string;
}[] = [
  {
    id: "connected",
    label: "Connected commerce",
    short: "One payment layer behind every place the customer meets the brand.",
    lead: "Connect the app, the counter and the online shop",
    rationale:
      "Use when the signals point at a seam between channels: a saved card that does not travel, a refund that cannot be found, a second checkout to maintain.",
  },
  {
    id: "choice",
    label: "Customer choice",
    short: "Let shoppers pay their way — online and in the aisle — without a second checkout.",
    lead: "Give guests the payment methods they already carry",
    rationale:
      "Use when the signals describe guests choosing, abandoning or asking for a payment method that the current setup handles awkwardly.",
  },
  {
    id: "simpler",
    label: "Simpler integration",
    short: "One unified API replaces a patchwork of payment integrations.",
    lead: "Spend less engineering time keeping checkouts in sync",
    rationale:
      "Use when the signals suggest maintenance load, multiple providers, or a team without spare engineering capacity.",
  },
];

export const DEFAULT_CAPABILITIES: Omit<Capability, "edited">[] = [
  {
    id: "cap_payments",
    label: "Online and in-store payments",
    statement:
      "Aurfy can support online and in-store payments, so the same brand experience can continue from app to counter.",
    approved: true,
  },
  {
    id: "cap_wallets",
    label: "Cards and digital wallets",
    statement:
      "Aurfy can support card payments and digital wallets, giving guests familiar ways to pay wherever they check out.",
    approved: true,
  },
  {
    id: "cap_api",
    label: "Unified API",
    statement:
      "Aurfy offers one unified API, so teams can connect their app, website and store systems without maintaining separate payment integrations.",
    approved: true,
  },
];

export const STAGES: {
  id: StageId;
  label: string;
  short: string;
  hint: string;
  tone: "neutral" | "primary" | "accent" | "success";
}[] = [
  { id: "research", label: "Research", short: "Research", hint: "Signals reviewed, brief not finalised.", tone: "neutral" },
  { id: "concept_ready", label: "Concept ready", short: "Concept", hint: "A reviewed concept is ready to discuss.", tone: "primary" },
  { id: "outreach_sent", label: "Outreach sent", short: "Sent", hint: "You copied and sent the note yourself.", tone: "accent" },
  { id: "responded", label: "Responded", short: "Replied", hint: "The prospect replied.", tone: "accent" },
  { id: "meeting", label: "Meeting booked", short: "Meeting", hint: "A conversation is on the calendar.", tone: "success" },
  { id: "opportunity", label: "Opportunity", short: "Opp", hint: "A qualified commercial conversation.", tone: "success" },
];

export const CONCEPT_PALETTES: {
  id: ConceptPaletteId;
  label: string;
  swatch: string;
  panel: string;
  ink: string;
  accent: string;
  tint: string;
}[] = [
  {
    id: "indigo",
    label: "Indigo",
    swatch: "hsl(252 62% 43%)",
    panel: "linear-gradient(160deg, hsl(250 56% 15%), hsl(252 62% 30%) 55%, hsl(266 64% 42%))",
    ink: "hsl(45 60% 98%)",
    accent: "hsl(73 84% 62%)",
    tint: "hsl(252 70% 96%)",
  },
  {
    id: "citron",
    label: "Citron",
    swatch: "hsl(73 84% 55%)",
    panel: "linear-gradient(160deg, hsl(234 32% 13%), hsl(240 24% 20%) 55%, hsl(250 30% 26%))",
    ink: "hsl(60 30% 97%)",
    accent: "hsl(73 88% 62%)",
    tint: "hsl(73 60% 93%)",
  },
  {
    id: "clay",
    label: "Clay",
    swatch: "hsl(18 64% 52%)",
    panel: "linear-gradient(160deg, hsl(22 44% 18%), hsl(18 52% 32%) 55%, hsl(12 64% 46%))",
    ink: "hsl(36 60% 97%)",
    accent: "hsl(36 92% 66%)",
    tint: "hsl(24 60% 94%)",
  },
  {
    id: "teal",
    label: "Teal",
    swatch: "hsl(178 54% 32%)",
    panel: "linear-gradient(160deg, hsl(190 48% 12%), hsl(184 48% 22%) 55%, hsl(176 52% 32%))",
    ink: "hsl(180 40% 97%)",
    accent: "hsl(76 78% 62%)",
    tint: "hsl(176 40% 93%)",
  },
];

export const DEMO_MERCHANT_SLUGS = ["marlow-fen", "halcyon-swim", "fernway-grocers"];
