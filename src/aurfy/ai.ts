import type { AngleId, Capability, Merchant, Signal } from "./types";
import type { OutreachParts } from "./draft";

/**
 * Optional server-side drafting through an Enter Cloud backend function.
 * The deterministic template path in `draft.ts` is always available and is used
 * whenever this path reports a failure, so the workflow never depends on AI.
 */
export const AI_AVAILABLE = true;
export const AI_MODEL_LABEL = "DeepSeek V4 Flash";
export const AI_FUNCTION_NAME = "aurfy-draft";

const SESSION_KEY = "aurfy.ai.session";

function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

type AiInput = {
  merchant: Merchant;
  signals: Signal[];
  angle: AngleId | null;
  capabilityIds: string[];
  capabilities: Capability[];
  chosenSignalId?: string | null;
};

export type AiBriefDraft = { observed: string; hypotheses: string; unknowns: string };
export type AiOutcome<T> = { ok: true; draft: T; model: string } | { ok: false; reason: string };

async function invoke<T extends "brief" | "outreach">(
  kind: T,
  input: AiInput,
): Promise<AiOutcome<T extends "brief" ? AiBriefDraft : OutreachParts>> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, reason: "You are offline. AI drafting needs a connection; the local template is still available." };
  }
  if (input.signals.length === 0) {
    return { ok: false, reason: "Select at least one signal before requesting an AI draft." };
  }

  const chosen = input.signals.find((signal) => signal.id === input.chosenSignalId) ?? input.signals[0];
  const selectedCapabilities = input.capabilities.filter((capability) =>
    input.capabilityIds.length === 0 ? true : input.capabilityIds.includes(capability.id),
  );

  try {
    // Load the backend client only when an AI draft is actually requested, so
    // the studio's first paint does not depend on the Cloud SDK.
    const { supabase } = await import("@/integrations/supabase/client");
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("AI drafting timed out.")), 50000);
    });
    const request = supabase.functions.invoke(AI_FUNCTION_NAME, {
      body: {
        kind,
        merchant: {
          name: input.merchant.name,
          category: input.merchant.category,
          notes: input.merchant.notes,
        },
        angle: input.angle,
        capabilities: selectedCapabilities.map((capability) => ({
          label: capability.label,
          statement: capability.statement,
        })),
        chosenSignalTitle: chosen?.title ?? null,
        signals: input.signals.slice(0, 6).map((signal) => ({
          title: signal.title,
          category: signal.category,
          provenance: signal.provenance,
          sourceName: signal.sourceName,
          sourceDate: signal.sourceDate,
          retrievedAt: signal.retrievedAt,
          evidence: signal.evidence,
          whyItMatters: signal.whyItMatters,
          novelty: signal.novelty,
          limitations: signal.limitations,
          confidence: signal.confidence,
          question: signal.question,
        })),
      },
      headers: { "X-Session-ID": sessionId() },
    });

    const response = await Promise.race([request, timeout]);
    if (response.error) {
      const context = (response.error as { context?: Response }).context;
      let detail = "";
      if (context && typeof context.json === "function") {
        try {
          const parsed = (await context.json()) as { error?: string };
          detail = parsed?.error ?? "";
        } catch {
          detail = "";
        }
      }
      return {
        ok: false,
        reason: detail || "The AI service could not be reached. The template draft is still available.",
      };
    }

    const data = response.data as
      | { ok?: boolean; draft?: unknown; model?: string; error?: string }
      | null;
    if (!data?.ok || !data.draft) {
      return { ok: false, reason: data?.error || "The AI draft came back incomplete. The template is still available." };
    }

    return {
      ok: true,
      draft: data.draft as T extends "brief" ? AiBriefDraft : OutreachParts,
      model: data.model || AI_MODEL_LABEL,
    };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error && error.message.includes("timed out")
          ? "AI drafting took too long. The template draft is still available."
          : "The AI service could not be reached. The template draft is still available.",
    };
  }
}

export function requestAiBrief(input: AiInput): Promise<AiOutcome<AiBriefDraft>> {
  return invoke("brief", input) as Promise<AiOutcome<AiBriefDraft>>;
}

export function requestAiOutreach(input: AiInput): Promise<AiOutcome<OutreachParts>> {
  return invoke("outreach", input) as Promise<AiOutcome<OutreachParts>>;
}
