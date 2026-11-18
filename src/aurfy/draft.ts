import { ANGLES } from "./content";
import type { AngleId, Capability, DraftResult, Merchant, Signal } from "./types";
import { clampText } from "./utils";

export type OutreachParts = {
  observation: string;
  hypothesis: string;
  capability: string;
  question: string;
};

const provenanceLabel = (signal: Signal) =>
  signal.provenance === "demo" ? "Fictional demo signal" : "User-supplied, unverified";

function sentence(text: string, max = 220): string {
  const clean = clampText(text, max);
  return clean.replace(/^Inference:\s*/i, "").replace(/^Fictional demo evidence:\s*/i, "");
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function templateBrief(merchant: Merchant, signals: Signal[]): DraftResult {
  if (signals.length === 0) {
    return {
      observed: "",
      hypotheses: "",
      unknowns: "",
      generation: "template",
      note: "Select at least one signal to assemble a brief.",
    };
  }
  const observed = signals
    .map(
      (signal) =>
        `• [${provenanceLabel(signal)}] ${signal.title} — ${sentence(signal.evidence)} (Source: ${signal.sourceName}. Publication date: ${
          signal.sourceDate ?? "not supplied"
        }; retrieved: ${signal.retrievedAt ? "yes" : "no"}.)`,
    )
    .join("\n");

  const hypotheses = signals
    .map((signal) => `• ${signal.whyItMatters.replace(/^Inference:\s*/i, "")} (Inference from: "${signal.title}".)`)
    .join("\n");

  const limitationLines = Array.from(new Set(signals.map((signal) => signal.limitations)))
    .map((limitation) => `• ${limitation}`)
    .join("\n");

  const unknowns = [
    limitationLines,
    "• No order volume, conversion, average basket, payment cost or settlement data was supplied.",
    signals.every((signal) => signal.provenance === "demo")
      ? "• The demo library has no real publication or retrieval dates; nothing here is independently verified."
      : "• User-supplied sources were not fetched or independently verified by this app.",
    "• Whether these observations are representative of the wider customer base. (Open question.)",
  ].join("\n");

  return {
    observed,
    hypotheses,
    unknowns,
    generation: "template",
    note: `Deterministic template assembled from ${signals.length} selected signal${signals.length === 1 ? "" : "s"}. No AI model was used.`,
  };
}

export function templateOutreach(
  merchant: Merchant,
  signals: Signal[],
  angle: AngleId | null,
  capability: Capability | undefined,
  primarySignalId: string | null,
): OutreachParts {
  const primary = signals.find((signal) => signal.id === primarySignalId) ?? signals[0];
  const angleMeta = ANGLES.find((item) => item.id === angle);

  const observation = primary
    ? `I'm working through a note about ${lowerFirst(primary.title.replace(/\.$/, ""))}. In our working notes: ${sentence(
        primary.evidence,
        180,
      )}`
    : `I'm looking at how ${merchant.name} keeps payment experience consistent between the app and the counter — and I don't want to assume what that looks like today.`;

  const hypothesis = primary
    ? `My hypothesis (not a finding): ${lowerFirst(sentence(primary.whyItMatters, 190))}`
    : `My hypothesis (not a finding): ${
        angleMeta?.short ?? "a joined-up payment experience may matter more as channels multiply."
      }`;

  const capabilityLine = capability
    ? `${capability.statement}${capability.edited ? " (Wording reviewed and edited by our team.)" : ""}`
    : "I'd keep any Aurfy capability claims to what is approved in our brief — no feature assumptions.";

  const question = primary?.question ?? "How do you think about payment consistency across your channels today?";

  return {
    observation: observation.trim(),
    hypothesis: hypothesis.trim(),
    capability: capabilityLine.trim(),
    question: question.trim(),
  };
}

export type ConceptCopy = { headline: string; subhead: string };

export function templateConcept(
  merchant: Merchant,
  signal: Signal | undefined,
  capability: Capability | undefined,
  angle: AngleId | null,
): ConceptCopy {
  const angleMeta = ANGLES.find((item) => item.id === angle);
  const name = merchant.name.replace(/\s+(Coffee Co\.|Coffee|Co\.|Ltd\.?|Inc\.?)$/i, "").trim() || merchant.name;
  const headline =
    angle === "simpler"
      ? "One integration. Every checkout."
      : angle === "choice"
        ? "Pay your way. Everywhere."
        : "One payment layer. Every counter.";

  const capabilityPhrase = capability
    ? capability.label.toLowerCase()
    : "a connected payment experience";

  const signalPhrase = signal ? `Built around one observed moment: ${lowerFirst(signal.title)}.` : "";

  const subhead = `${name} × Aurfy — ${capabilityPhrase} across app, counter and online. ${signalPhrase}`.trim();

  return {
    headline: headline,
    subhead: clampText(subhead, 210),
  };
}

export function draftSourceLabel(generation: "template" | "ai" | "manual"): string {
  if (generation === "ai") return "AI-assisted";
  if (generation === "template") return "Template";
  return "Manual";
}
