const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const USER_AGENT = "AurfySignalStudio/1.0 (hackathon prototype; single public page fetch)";
const MAX_HTML_BYTES = 350_000;
const MAX_TEXT_EXCERPT = 1_100;

const CHANNELS: { label: string; patterns: RegExp }[] = [
  { label: "Order ahead / pickup", patterns: /order\s*(ahead|online|for pickup)|pickup|click\s*(and|&)\s*collect/i },
  { label: "Delivery / shipping", patterns: /delivery|ship(ping)?|deliver/i },
  { label: "Subscriptions", patterns: /subscription|subscribe\s*(and|&)\s*save|recurring/i },
  { label: "Online shop", patterns: /add to cart|checkout|shop now|online shop|e-?commerce/i },
  { label: "Gift cards / gifting", patterns: /gift card|e-?gift|gifting/i },
  { label: "Wholesale", patterns: /wholesale|trade account|stockist/i },
  { label: "Locations / visit info", patterns: /locations|stores|visit us|caf[eé]s|our caf[eé]s/i },
];

const PAYMENT_TERMS: { label: string; pattern: RegExp }[] = [
  { label: "Apple Pay", pattern: /apple\s*pay/i },
  { label: "Google Pay", pattern: /google\s*pay/i },
  { label: "PayPal", pattern: /paypal/i },
  { label: "Klarna", pattern: /klarna/i },
  { label: "Afterpay", pattern: /afterpay/i },
  { label: "Tap to pay", pattern: /tap\s*to\s*pay|contactless/i },
  { label: "Digital wallet", pattern: /digital wallet|mobile wallet/i },
];

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number(dec)));
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function excerpt(value: string, max = MAX_TEXT_EXCERPT): string {
  const clean = stripTags(value);
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function blockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".example")) return true;
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const attr of match[0].matchAll(/([a-zA-Z:_-]+)=["']([^"']*)["']/g)) {
      attrs[attr[1].toLowerCase()] = decodeEntities(attr[2]);
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content && !meta[key]) meta[key] = attrs.content;
  }
  return meta;
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(decodeEntities(match[1].trim()));
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of entries) {
        if (!entry || typeof entry !== "object") continue;
        const graph = (entry as Record<string, unknown>)["@graph"];
        if (Array.isArray(graph)) {
          results.push(...graph.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")));
        } else {
          results.push(entry as Record<string, unknown>);
        }
      }
    } catch {
      // Ignore malformed structured data.
    }
  }
  return results;
}

const GENERIC_NAMES = /^(home|homepage|home page|welcome|index|main|official (web)?site|website|site|shop|store|online (store|shop)|untitled|page)$/i;

function brandLabel(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\d*\./, "").split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  const second = parts[parts.length - 2];
  return parts.length >= 3 && /^(co|com|net|org|gov|ac|edu)$/.test(second) ? parts[parts.length - 3] : second;
}

/**
 * The company name, not the page title. Titles are often "Home" or carry a
 * tagline, so prefer og:site_name / JSON-LD, then a title segment matching the
 * domain, then a name built from the domain.
 */
function extractSiteName(
  meta: Record<string, string>,
  jsonLd: Record<string, unknown>[],
  title: string,
  hostname: string,
): string {
  const usable = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 60 && !GENERIC_NAMES.test(value.trim());
  if (usable(meta["og:site_name"])) return meta["og:site_name"].trim();
  if (usable(meta["application-name"])) return meta["application-name"].trim();
  for (const entry of jsonLd) {
    const type = String(entry["@type"] ?? "");
    if (/Organization|Store|Restaurant|LocalBusiness|WebSite|Brand/i.test(type) && usable(entry.name)) {
      return String(entry.name).trim();
    }
  }
  const brand = brandLabel(hostname);
  const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const segments = title
    .split(/\s+[|\u2013\u2014\-\u00b7\u2022:\u00bb]\s+|\s*[|\u2013\u2014\u00b7\u2022\u00bb]\s*|:\s+/)
    .map((segment) => segment.trim().replace(/[.!]+$/, ""))
    .filter((segment) => segment && !GENERIC_NAMES.test(segment));
  const match = segments.find((segment) => {
    const seg = squash(segment);
    return seg === brand || (seg.length >= 3 && brand.includes(seg));
  });
  if (match) return match;
  return brand
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || hostname;
}

function extractLinks(html: string, baseUrl: string): { url: string; label: string }[] {
  const links: { url: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = stripTags(match[2]).slice(0, 80);
    if (
      !/location|store|caf[eé]|menu|order|shop|pickup|delivery|subscription|gift|wholesale|press|news|about|career|visit/i.test(
        `${label} ${match[1]}`,
      )
    ) {
      continue;
    }
    try {
      const url = new URL(match[1], baseUrl);
      if (!/^https?:$/.test(url.protocol) || seen.has(url.href)) continue;
      seen.add(url.href);
      links.push({ url: url.href, label: label || url.pathname });
      if (links.length >= 10) break;
    } catch {
      // Ignore malformed hrefs.
    }
  }
  return links;
}

function extractLogo(
  html: string,
  baseUrl: string,
  meta: Record<string, string>,
  jsonLd: Record<string, unknown>[],
): { url: string; source: string } | null {
  const candidates: { url: string; score: number; source: string }[] = [];
  const push = (raw: string | undefined, score: number, source: string) => {
    if (!raw) return;
    try {
      const url = new URL(raw, baseUrl);
      if (!/^https?:$/.test(url.protocol)) return;
      candidates.push({ url: url.href, score, source });
    } catch {
      // Ignore malformed asset URLs.
    }
  };

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const attr of match[0].matchAll(/([a-zA-Z:_-]+)=["']([^"']*)["']/g)) {
      attrs[attr[1].toLowerCase()] = attr[2];
    }
    const rel = attrs.rel || "";
    if (!/icon/i.test(rel)) continue;
    const size = Number.parseInt(attrs.sizes || "", 10) || 0;
    if (/apple-touch-icon/i.test(rel)) {
      push(attrs.href, 90, "apple-touch-icon");
    } else {
      push(attrs.href, size >= 64 ? 80 : 70, size ? `${size}px icon` : "site icon");
    }
  }

  for (const entry of jsonLd) {
    const logo = entry.logo;
    if (typeof logo === "string") push(logo, 88, "structured-data logo");
    else if (logo && typeof logo === "object" && typeof (logo as Record<string, unknown>).url === "string") {
      push((logo as Record<string, string>).url, 88, "structured-data logo");
    }
  }

  if (meta["og:logo"]) push(meta["og:logo"], 86, "og:logo");
  if (meta["og:image"]) push(meta["og:image"], 40, "og:image");
  push("/favicon.ico", 20, "favicon.ico");

  return candidates.sort((a, b) => b.score - a.score)[0] ?? null;
}

function firstDate(meta: Record<string, string>, jsonLd: Record<string, unknown>[]): string | null {
  const candidates = [
    meta["article:published_time"],
    meta["article:modified_time"],
    meta["date"],
    ...jsonLd
      .flatMap((entry) => [entry.datePublished, entry.dateModified])
      .filter((value): value is string => typeof value === "string"),
  ];
  for (const candidate of candidates) {
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  // A retrieval timestamp is not a publication date; do not substitute it.
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, message: "Use POST." }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as { url?: string };
    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!rawUrl) return json({ success: false, message: "Paste a public company URL first." }, 400);

    let target: URL;
    try {
      target = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    } catch {
      return json({ success: false, message: "That URL could not be parsed." }, 400);
    }
    if (!/^https?:$/.test(target.protocol) || blockedHost(target.hostname)) {
      return json({ success: false, message: "Only public http(s) pages can be fetched." }, 400);
    }
    if (target.username || target.password) {
      return json({ success: false, message: "URLs with embedded credentials are not allowed." }, 400);
    }

    const response = await fetch(target.href, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });

    const finalUrl = new URL(response.url || target.href);
    if (blockedHost(finalUrl.hostname)) {
      return json({ success: false, message: "The page redirected to a non-public address." }, 400);
    }
    if (!response.ok) {
      return json(
        {
          success: false,
          message: `The site returned HTTP ${response.status}. Try its public homepage or another permitted source.`,
        },
        502,
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return json({ success: false, message: "That URL did not return an HTML page." }, 415);
    }
    const length = Number(response.headers.get("content-length") || "0");
    if (length > 2_000_000) {
      return json({ success: false, message: "The page is too large for a bounded prototype fetch." }, 413);
    }

    const html = (await response.text()).slice(0, MAX_HTML_BYTES);
    const retrievedAt = new Date().toISOString();
    const meta = extractMeta(html);
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const title = excerpt(meta["og:title"] || titleTag || finalUrl.hostname, 160);
    const description = excerpt(meta["og:description"] || meta.description || meta["twitter:description"] || "", 320);
    const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean)
      .slice(0, 4);
    const jsonLd = extractJsonLd(html);
    const siteName = extractSiteName(meta, jsonLd, title, finalUrl.hostname);
    const sourceDate = firstDate(meta, jsonLd);
    const logo = extractLogo(html, finalUrl.href, meta, jsonLd);
    const links = extractLinks(html, finalUrl.href);

    const visibleHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
    const text = excerpt(visibleHtml);
    const haystack = `${title} ${description} ${headings.join(" ")} ${text}`;
    const channels = CHANNELS.filter((channel) => channel.patterns.test(haystack)).map((channel) => channel.label);
    const paymentTerms = PAYMENT_TERMS.filter((term) => term.pattern.test(haystack)).map((term) => term.label);
    const locationMatch = haystack.match(/\b(\d{1,3})\s+(?:locations?|caf[eé]s?|stores?|shops?|outlets?)\b/i);

    const sourceName = `Live public page — ${finalUrl.hostname.replace(/^www\./, "")}`;
    const base = {
      sourceName,
      sourceUrl: finalUrl.href,
      sourceDate,
      retrievedAt,
      provenance: "public" as const,
      confidence: "medium" as const,
      tags: ["live research", "public page", finalUrl.hostname.replace(/^www\./, "")],
    };
    const limitations =
      "Automated extraction from one public page fetched for this session. Not independently audited; the page can change and no payment, volume or customer data is implied.";

    const signals = [
      {
        ...base,
        category: "customer" as const,
        title: `Live page snapshot: ${siteName}`,
        evidence: `Fetched ${finalUrl.href} on ${new Date(retrievedAt).toLocaleDateString("en-GB")}. Page title: "${title}". Description: ${
          description ? `"${description}"` : "not provided."
        }${headings.length ? ` Main headings: ${headings.map((heading) => `"${heading}"`).join("; ")}.` : ""} Visible text begins: "${text.slice(0, 460)}"`,
        whyItMatters:
          "Inference: this is a current public description of the merchant's customer-facing offer. The page may be a useful starting point, but it does not reveal the payment stack, volumes or internal priorities.",
        novelty: "Live public snapshot fetched at the time shown; not a bundled demo record.",
        limitations,
        question: "Which part of this public customer experience should we ask about first?",
      },
      ...(channels.length
        ? [
            {
              ...base,
              category: "customer" as const,
              title: `Public page points to: ${channels.slice(0, 4).join(", ")}`,
              evidence: `Detected on the fetched page (${finalUrl.href}): ${channels.join("; ")}.${
                locationMatch ? ` The page also mentions "${locationMatch[0]}".` : ""
              } Relevant links found: ${links
                .slice(0, 4)
                .map((link) => `${link.label || link.url} (${link.url})`)
                .join("; ") || "none"}.`,
              whyItMatters:
                "Inference: multiple customer entry points can create a handoff worth asking about. The page does not state whether these flows share a payment relationship.",
              novelty:
                "Live public snapshot: these are the channels the page presents now, not a trend or a measured customer behaviour.",
              limitations,
              question: `How do ${channels.slice(0, 3).join(", ")} connect to the same customer and payment experience today?`,
            },
          ]
        : []),
      ...(paymentTerms.length
        ? [
            {
              ...base,
              category: "customer" as const,
              confidence: "low" as const,
              title: `Public page references ${paymentTerms.slice(0, 3).join(", ")}`,
              evidence: `The fetched page mentions: ${paymentTerms.join(", ")}. This is a text observation only; the page does not confirm which flows use them or whether they are active.`,
              whyItMatters:
                "Inference: visible payment-method language may reflect customer expectations, but it is not proof of a working integration or a merchant priority.",
              novelty: "Live public snapshot: a keyword observation, not a product or payment-stack audit.",
              limitations,
              question: "Which of these payment methods matters most at the counter versus online?",
            },
          ]
        : []),
    ].slice(0, 3);

    const warnings: string[] = [];
    if (!description) warnings.push("No meta description was found; the observation relies on the title and visible text.");
    if (channels.length === 0) warnings.push("No clear ordering, location or commerce links were detected.");
    if (!sourceDate) warnings.push("No publication or modification date was exposed on the page.");
    if (jsonLd.length === 0) warnings.push("No JSON-LD structured data was found.");

    return json({
      success: true,
      fetchedAt: retrievedAt,
      page: {
        url: finalUrl.href,
        title,
        siteName,
        description,
        sourceDate,
        headings,
        channels,
        paymentTerms,
        locationHint: locationMatch?.[0] ?? null,
        links,
        logoUrl: logo?.url ?? null,
        logoSource: logo?.source ?? null,
        warnings,
      },
      signals,
      message: "One public page was fetched. Review the extracted observations before using them.",
    });
  } catch (error) {
    console.error("aurfy-live-page failed", error instanceof Error ? error.message : String(error));
    return json(
      {
        success: false,
        message:
          error instanceof Error && error.name === "TimeoutError"
            ? "The page took too long to respond. Try its homepage or another public source."
            : "The page could not be fetched. The site may block automated requests; nothing was invented.",
      },
      502,
    );
  }
});
