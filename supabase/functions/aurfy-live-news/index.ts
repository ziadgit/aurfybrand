const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const USER_AGENT = "AurfySignalStudio/1.0 (hackathon prototype; public RSS headline lookup)";
const MAX_ITEMS = 4;

type RssItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  publisher: string;
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number(dec)));
}

function clean(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? clean(match[1]) : "";
}

function parseItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const block = match[1];
    const rawTitle = tag(block, "title");
    const link = tag(block, "link");
    const pubDate = tag(block, "pubDate");
    const publisher = tag(block, "source") || tag(block, "News:Source") || "";
    if (!rawTitle || !/^https?:\/\//i.test(link)) continue;
    const parsedDate = pubDate ? new Date(pubDate) : null;
    const publishedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
    let title = rawTitle;
    if (publisher && title.endsWith(` - ${publisher}`)) title = title.slice(0, -` - ${publisher}`.length).trim();
    items.push({ title: title.slice(0, 220), link, publishedAt, publisher });
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, message: "Use POST." }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as { query?: string; limit?: number };
    const query = typeof body.query === "string" ? body.query.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    if (query.length < 2) return json({ success: false, message: "Enter a company or category to search." }, 400);
    const limit = Math.min(MAX_ITEMS, Math.max(1, Number(body.limit) || 3));

    const providers = [
      {
        name: "Google News RSS",
        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
      },
      {
        name: "Bing News RSS",
        url: `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`,
      },
    ];

    let provider = "";
    let items: RssItem[] = [];

    for (const candidate of providers) {
      try {
        const response = await fetch(candidate.url, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml,application/xml,text/xml" },
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) continue;
        const xml = (await response.text()).slice(0, 300_000);
        const parsed = parseItems(xml);
        if (parsed.length > 0) {
          provider = candidate.name;
          items = parsed.slice(0, limit);
          break;
        }
      } catch {
        // Try the next public RSS provider.
      }
    }

    if (!provider || items.length === 0) {
      return json(
        {
          success: false,
          message: "No public headlines were returned for that query. Try a broader company or category term.",
        },
        502,
      );
    }

    const retrievedAt = new Date().toISOString();
    const signals = items.map((item) => {
      const publisher = item.publisher || new URL(item.link).hostname.replace(/^www\./, "");
      return {
        category: "peer" as const,
        title: item.title,
        sourceName: `${provider} — ${publisher}`,
        sourceUrl: item.link,
        sourceDate: item.publishedAt,
        retrievedAt,
        provenance: "news" as const,
        evidence: `Live public news headline: "${item.title}". Publisher: ${publisher}. Published: ${
          item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-GB") : "not supplied by the feed"
        }. The headline was retrieved from ${provider}; the article body was not fetched.`,
        whyItMatters:
          "Inference: this headline may point to a relevant market or peer development. A headline does not verify the article's details, and no engagement or business outcome is implied.",
        novelty: "Live RSS result fetched at the time shown; not a bundled demo record.",
        limitations:
          "Headline only. The article body was not fetched or independently verified; headlines can be syndicated, edited or incomplete. No engagement, reach or financial data is implied.",
        confidence: "low" as const,
        question: "What, if anything, would this development change for a merchant's payment or channel plans?",
        tags: ["live news", "rss", provider.toLowerCase().replace(/\s+/g, "-"), query.toLowerCase()],
      };
    });

    return json({
      success: true,
      provider,
      query,
      retrievedAt,
      items,
      signals,
      message: `${items.length} live public headline${items.length === 1 ? "" : "s"} retrieved. Article bodies were not fetched.`,
    });
  } catch (error) {
    console.error("aurfy-live-news failed", error instanceof Error ? error.message : String(error));
    return json(
      {
        success: false,
        message:
          error instanceof Error && error.name === "TimeoutError"
            ? "The public news feed timed out. Try again in a moment."
            : "The public news lookup failed. Nothing was invented.",
      },
      502,
    );
  }
});
