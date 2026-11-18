const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "deepseek/deepseek-v4-flash";
const MAX_SIGNALS = 6;

const SYSTEM_PROMPT = `You help a lean B2B go-to-market team at Aurfy draft a merchant brief or a short outreach note.

Hard rules:
1. Use ONLY facts present in the supplied JSON. Never invent an article, date, metric, quote, trend, engagement number, competitor claim or proof of merchant interest.
2. Demo signals are fictional prototypes. Attribute them explicitly as fictional/demo. User-supplied signals are unverified; never upgrade them to verified research.
3. Aurfy capabilities are limited to: online and in-store payments; cards and digital wallets; one unified API. Never add rates, coverage, certifications, client names, partnerships, performance or launch claims.
4. Clearly separate observation from inference. A hypothesis must read as a hypothesis. Unknowns must include what the evidence cannot support.
5. No promises, no guarantees, no claim that a partnership exists, no auto-send language.
6. Output strict JSON only, no markdown fences, no commentary.

JSON shape:
- kind "brief": {"observed": string, "hypotheses": string, "unknowns": string}
  observed: 3-5 lines starting "• ", each naming the signal provenance and what it says. Only signals belong here.
  hypotheses: 2-4 lines starting "• ", each inferential and hedged.
  unknowns: 3-5 lines starting "• ", limitations, missing volume/revenue/payment data, unverified sources.
  Do not comment on the JSON, the request, the merchant record, the angle field, or the absence/presence of fields.
  Do not add a line saying what was not supplied unless it is a genuine limitation of the evidence.
- kind "outreach": {"observation": string, "hypothesis": string, "capability": string, "question": string}
  observation: one or two sentences grounded in one supplied signal, naming demo/user provenance.
  hypothesis: explicitly starts "My hypothesis (not a finding):" and stays hedged.
  capability: paraphrase one supplied approved capability statement, nothing more.
  question: one open question drawn from the signal's discussion question.
  Keep the four fields together under 900 characters.
  Return plain sentences only: no bullet markers, no preamble, no mention of JSON or the request.`;

type SignalPayload = {
  title?: string;
  category?: string;
  provenance?: string;
  sourceName?: string;
  sourceDate?: string | null;
  retrievedAt?: string | null;
  evidence?: string;
  whyItMatters?: string;
  novelty?: string;
  limitations?: string;
  confidence?: string;
  question?: string;
};

type Body = {
  kind?: string;
  merchant?: { name?: string; category?: string; notes?: string };
  signals?: SignalPayload[];
  angle?: { label?: string; short?: string } | null;
  capabilities?: { label?: string; statement?: string }[];
  chosenSignalTitle?: string | null;
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function clean(value: string, max: number): string {
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Use POST for this drafting function." }, 405);
  }

  const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_d14079b4625f");
  if (!AI_API_TOKEN) {
    console.error("aurfy-draft: AI token secret is missing");
    return json({ ok: false, error: "AI drafting is not configured on this backend." }, 503);
  }

  try {
    const body = (await req.json()) as Body;
    const kind = body.kind === "brief" || body.kind === "outreach" ? body.kind : null;
    if (!kind) return json({ ok: false, error: "Choose a draft kind." }, 400);

    const signals = (Array.isArray(body.signals) ? body.signals : []).slice(0, MAX_SIGNALS);
    if (signals.length === 0) {
      return json({ ok: false, error: "Select at least one signal before asking for a draft." }, 400);
    }

    const capabilities = (Array.isArray(body.capabilities) ? body.capabilities : []).slice(0, 3);
    const payload = {
      kind,
      merchant: {
        name: clean(body.merchant?.name ?? "", 120),
        category: clean(body.merchant?.category ?? "", 160),
        notes: clean(body.merchant?.notes ?? "", 800),
      },
      angle: body.angle
        ? { label: clean(body.angle.label ?? "", 80), short: clean(body.angle.short ?? "", 240) }
        : null,
      capabilities: capabilities.map((capability) => ({
        label: clean(capability.label ?? "", 80),
        statement: clean(capability.statement ?? "", 400),
      })),
      chosenSignalTitle: body.chosenSignalTitle ? clean(body.chosenSignalTitle, 200) : null,
      signals: signals.map((signal) => ({
        title: clean(signal.title ?? "", 200),
        category: signal.category === "peer" ? "peer" : "customer",
        provenance: signal.provenance === "demo" ? "demo (fictional)" : "user-supplied (unverified)",
        sourceName: clean(signal.sourceName ?? "", 160),
        sourceDate: signal.sourceDate ? clean(signal.sourceDate, 40) : "not supplied",
        retrievedAt: signal.retrievedAt ? "retrieved" : "not retrieved by this app",
        evidence: clean(signal.evidence ?? "", 1200),
        whyItMatters: clean(signal.whyItMatters ?? "", 700),
        novelty: clean(signal.novelty ?? "", 500),
        limitations: clean(signal.limitations ?? "", 500),
        confidence: clean(signal.confidence ?? "", 20),
        question: clean(signal.question ?? "", 300),
      })),
      today: new Date().toISOString().slice(0, 10),
    };

    const sessionId = req.headers.get("X-Session-ID")?.trim() || crypto.randomUUID();
    const response = await fetch("https://api.enter.pro/code/api/v1/ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
        "X-Enter-Project-ID": "d14079b4625f4011bd68f5b82bd7bf6a",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(payload) },
        ],
        stream: false,
        temperature: 0.25,
        max_tokens: 1400,
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      const text = await response.text();
      let upstreamMessage = "";
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } };
        upstreamMessage = parsed.error?.message ?? "";
      } catch {
        upstreamMessage = text.slice(0, 300);
      }
      console.error("aurfy-draft upstream error", response.status, upstreamMessage);
      return json({ ok: false, error: upstreamMessage || "The AI service could not complete this draft." }, response.status);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: unknown;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      console.error("aurfy-draft: model returned no parsable JSON", content.slice(0, 300));
      return json({ ok: false, error: "The AI response was not valid JSON. Use the template instead." }, 502);
    }

    if (kind === "brief") {
      const observed = typeof parsed.observed === "string" ? clean(parsed.observed, 4000) : "";
      const hypotheses = typeof parsed.hypotheses === "string" ? clean(parsed.hypotheses, 3000) : "";
      const unknowns = typeof parsed.unknowns === "string" ? clean(parsed.unknowns, 3000) : "";
      if (!observed || !hypotheses || !unknowns) {
        return json({ ok: false, error: "The AI brief was incomplete. Use the template instead." }, 502);
      }
      return json({ ok: true, kind, model: MODEL, draft: { observed, hypotheses, unknowns } });
    }

    const observation = typeof parsed.observation === "string" ? clean(parsed.observation, 1200) : "";
    const hypothesis = typeof parsed.hypothesis === "string" ? clean(parsed.hypothesis, 1200) : "";
    const capability = typeof parsed.capability === "string" ? clean(parsed.capability, 1200) : "";
    const question = typeof parsed.question === "string" ? clean(parsed.question, 600) : "";
    if (!observation || !hypothesis || !capability || !question) {
      return json({ ok: false, error: "The AI outreach draft was incomplete. Use the template instead." }, 502);
    }
    return json({ ok: true, kind, model: MODEL, draft: { observation, hypothesis, capability, question } });
  } catch (error) {
    console.error("aurfy-draft failed", error instanceof Error ? error.message : String(error));
    return json({ ok: false, error: "Drafting failed. Use the deterministic template." }, 500);
  }
});
