import { useCallback, useEffect, useRef, useState } from "react";

export type ConceptVisualInput = {
  headline: string;
  subhead: string;
  merchantName: string;
  category: string;
  angle: string;
  palette: string;
};

export type VisualResult =
  | { ok: true; url: string; prompt: string }
  | { ok: false; reason: string };

export type VisualPhase = "idle" | "submitting" | "polling" | "error";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 56;

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function invokeErrorMessage(error: unknown): Promise<string> {
  const context = (error as { context?: Response }).context;
  if (context && typeof context.json === "function") {
    try {
      const body = (await context.json()) as { message?: string; error?: string };
      if (body?.message) return body.message;
      if (body?.error) return body.error;
    } catch {
      // Fall through to the generic message.
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "The image service could not be reached. Please try again.";
}

/**
 * Drives the two-step async image flow:
 * submit -> poll Enter's task status until succeed/failed.
 * The model and safety constraints live on the backend; the browser never sees
 * the AI token and never composes an unbounded prompt.
 */
export function useConceptVisual() {
  const [phase, setPhase] = useState<VisualPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  const generate = useCallback(async (input: ConceptVisualInput): Promise<VisualResult> => {
    if (inFlight.current) {
      return { ok: false, reason: "A visual is already being generated." };
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setPhase("error");
      const reason = "You are offline. Generating a visual needs a connection.";
      setError(reason);
      return { ok: false, reason };
    }

    inFlight.current = true;
    cancelled.current = false;
    setError(null);
    setPhase("submitting");

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const submit = await supabase.functions.invoke("aurfy-image-submit", { body: input });
      if (submit.error) {
        const reason = await invokeErrorMessage(submit.error);
        setPhase("error");
        setError(reason);
        return { ok: false, reason };
      }

      const submitted = submit.data as { success?: boolean; task_id?: string; prompt?: string; message?: string } | null;
      if (!submitted?.success || !submitted.task_id) {
        const reason = submitted?.message || "The image service could not start this generation.";
        setPhase("error");
        setError(reason);
        return { ok: false, reason };
      }

      setPhase("polling");
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        await delay(POLL_INTERVAL_MS);
        if (cancelled.current) {
          return { ok: false, reason: "Generation stopped because you left the page." };
        }

        const status = await supabase.functions.invoke("aurfy-image-status", {
          body: { task_id: submitted.task_id },
        });
        if (status.error) {
          const reason = await invokeErrorMessage(status.error);
          setPhase("error");
          setError(reason);
          return { ok: false, reason };
        }

        const task = status.data as {
          success?: boolean;
          status?: string;
          images?: { url?: string }[];
          error?: string;
          message?: string;
        } | null;

        if (task?.status === "failed") {
          const reason = task.error || task.message || "The image could not be generated. Try a different concept.";
          setPhase("error");
          setError(reason);
          return { ok: false, reason };
        }

        if (task?.status === "succeed") {
          const url = task.images?.find((image) => typeof image.url === "string" && image.url.length > 0)?.url;
          if (!url) {
            const reason = "The image finished without a usable URL. Try again.";
            setPhase("error");
            setError(reason);
            return { ok: false, reason };
          }
          setPhase("idle");
          setError(null);
          return { ok: true, url, prompt: submitted.prompt ?? "" };
        }
      }

      const reason = "The visual is taking longer than two minutes. Try again in a moment.";
      setPhase("error");
      setError(reason);
      return { ok: false, reason };
    } catch (caught) {
      const reason = await invokeErrorMessage(caught);
      setPhase("error");
      setError(reason);
      return { ok: false, reason };
    } finally {
      inFlight.current = false;
    }
  }, []);

  return {
    phase,
    error,
    isGenerating: phase === "submitting" || phase === "polling",
    generate,
  };
}
