import type { Signal } from "./types";

export type LiveSignalSeed = Omit<Signal, "id" | "status" | "addedAt">;

export type LivePage = {
  url: string;
  title: string;
  /** Declared site name (og:site_name / JSON-LD). Optional: older deployments omit it. */
  siteName?: string | null;
  description: string;
  sourceDate: string | null;
  headings: string[];
  channels: string[];
  paymentTerms: string[];
  locationHint: string | null;
  links: { url: string; label: string }[];
  logoUrl: string | null;
  logoSource: string | null;
  warnings: string[];
};

export type LivePageData = {
  fetchedAt: string;
  page: LivePage;
  signals: LiveSignalSeed[];
  message: string;
};

export type LiveNewsItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  publisher: string;
};

export type LiveNewsData = {
  provider: string;
  query: string;
  retrievedAt: string;
  items: LiveNewsItem[];
  signals: LiveSignalSeed[];
  message: string;
};

type Outcome<T> = { ok: true; data: T } | { ok: false; reason: string };

function fail(reason: string): { ok: false; reason: string } {
  return { ok: false, reason };
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
  return "The live lookup could not be reached. Nothing was invented.";
}

async function invokeLive<T extends { success?: boolean; message?: string }>(
  functionName: "aurfy-live-page" | "aurfy-live-news",
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Outcome<T>> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return fail("You are offline. Live research needs a connection.");
  }

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("Live lookup timed out.")), timeoutMs);
    });
    const request = supabase.functions.invoke(functionName, { body });
    const response = await Promise.race([request, timeout]);

    if (response.error) return fail(await invokeErrorMessage(response.error));
    const data = response.data as T | null;
    if (!data?.success) return fail(data?.message || "The live lookup returned no usable data.");
    return { ok: true, data };
  } catch (error) {
    return fail(await invokeErrorMessage(error));
  }
}

export function fetchLivePage(url: string): Promise<Outcome<LivePageData>> {
  return invokeLive<LivePageData>("aurfy-live-page", { url }, 30000);
}

export function fetchLiveNews(query: string, limit = 3): Promise<Outcome<LiveNewsData>> {
  return invokeLive<LiveNewsData>("aurfy-live-news", { query, limit }, 22000);
}
