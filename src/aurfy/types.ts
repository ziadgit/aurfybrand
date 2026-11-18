export type SignalCategory = "customer" | "peer";
export type SignalStatus = "new" | "selected" | "saved" | "rejected";
export type Confidence = "low" | "medium" | "high";
export type Provenance = "demo" | "user";

export type Signal = {
  id: string;
  category: SignalCategory;
  title: string;
  sourceName: string;
  sourceUrl: string;
  /** Publication date supplied by the source or the user. Null = unavailable. */
  sourceDate: string | null;
  /** Retrieval timestamp only when the app actually fetched the page. */
  retrievedAt: string | null;
  provenance: Provenance;
  /** What was observed, quoted or pasted. Never treated as verified. */
  evidence: string;
  /** Explicitly an inference made by the team, not a fact. */
  whyItMatters: string;
  novelty: string;
  limitations: string;
  confidence: Confidence;
  question: string;
  tags: string[];
  status: SignalStatus;
  addedAt: string;
};

export type Merchant = {
  id: string;
  name: string;
  url: string;
  category: string;
  notes: string;
  isDemo: boolean;
  createdAt: string;
};

export type Brief = {
  observed: string;
  hypotheses: string;
  unknowns: string;
  reviewed: boolean;
  updatedAt: string;
  generatedFrom: string[];
  generation: "template" | "ai" | "manual";
};

export type AngleId = "connected" | "choice" | "simpler";

export type Capability = {
  id: string;
  label: string;
  statement: string;
  approved: boolean;
  edited: boolean;
};

export type Positioning = {
  angle: AngleId | null;
  capabilityIds: string[];
  capabilities: Capability[];
  reviewed: boolean;
  updatedAt: string;
};

export type ConceptPaletteId = "indigo" | "citron" | "clay" | "teal";

export type ConceptDraft = {
  headline: string;
  subhead: string;
  palette: ConceptPaletteId;
  logoDataUrl: string | null;
  merchantDisplayName: string;
  signalId: string | null;
  capabilityId: string | null;
  /** Optional AI-generated illustrative artwork; never a logo or official asset. */
  imageUrl?: string | null;
  imagePrompt?: string | null;
  imageGeneratedAt?: string | null;
  reviewed: boolean;
  updatedAt: string;
};

export type OutreachDraft = {
  observation: string;
  hypothesis: string;
  capability: string;
  question: string;
  generation: "template" | "ai" | "manual";
  generationNote: string;
  signalId: string | null;
  capabilityId: string | null;
  angle: AngleId | null;
  reviewed: boolean;
  updatedAt: string;
};

export type StageId = "research" | "concept_ready" | "outreach_sent" | "responded" | "meeting" | "opportunity";

export type PipelineEntry = {
  stage: StageId;
  nextAction: string;
  dueDate: string;
  notes: string;
  history: { stage: StageId; at: string }[];
  updatedAt: string;
};

export type WorkspaceState = {
  version: 1;
  merchants: Merchant[];
  activeMerchantId: string;
  signalsByMerchant: Record<string, Signal[]>;
  briefs: Record<string, Brief>;
  positioning: Record<string, Positioning>;
  concepts: Record<string, ConceptDraft>;
  outreach: Record<string, OutreachDraft>;
  pipeline: Record<string, PipelineEntry>;
  seededAt: string;
  updatedAt: string;
};

export type DraftResult = {
  observed: string;
  hypotheses: string;
  unknowns: string;
  generation: "template" | "ai";
  note: string;
};
