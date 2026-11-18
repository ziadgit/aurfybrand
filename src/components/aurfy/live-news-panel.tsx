import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Newspaper, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import { fetchLiveNews, type LiveNewsData } from "@/aurfy/live-research";
import { formatDate, formatDateTime } from "@/aurfy/utils";
import { Button } from "@/components/ui/button";
import { Pill } from "./ui-bits";

export function LiveNewsPanel() {
  const { merchant, addSignalsToMerchant } = useStudio();
  const online = useOnline();
  const [query, setQuery] = useState(merchant.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiveNewsData | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setQuery(merchant.name);
    setResult(null);
    setAdded(false);
    setError(null);
  }, [merchant.id, merchant.name]);

  const run = async () => {
    const cleaned = query.trim();
    if (cleaned.length < 2) {
      setError("Enter a company or category to search.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    setAdded(false);
    const outcome = await fetchLiveNews(cleaned, 3);
    if (outcome.ok) {
      setResult(outcome.data);
    } else {
      setError(outcome.reason);
    }
    setBusy(false);
  };

  const add = () => {
    if (!result) return;
    const count = addSignalsToMerchant(merchant.id, result.signals);
    if (count === 0) {
      toast.info("Those headlines are already in this workspace");
      setAdded(true);
      return;
    }
    setAdded(true);
    toast.success(`${count} live headline${count === 1 ? "" : "s"} added`, {
      description: "Added as peer signals with real publication dates and links. The article bodies were not fetched.",
    });
  };

  return (
    <section className="surface border-primary/15 p-4 sm:p-5" aria-labelledby="live-news-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono-label text-[9px] text-primary">Live public info</p>
          <h2 id="live-news-title" className="mt-1 text-[15px] font-semibold text-foreground">
            Pull current headlines into this feed
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
            Searches a public RSS news feed at request time. Adds real headline, publisher, publication date and link as peer
            signals; it does not fetch or verify the article body.
          </p>
        </div>
        <Pill tone="primary" icon={Newspaper}>
          Live RSS
        </Pill>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="live-news-query" className="sr-only">
          Live news search
        </label>
        <input
          id="live-news-query"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setResult(null);
            setAdded(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void run();
            }
          }}
          className="aurfy-input"
          placeholder="Company or category, e.g. specialty coffee"
          maxLength={120}
        />
        <Button
          type="button"
          className="tap min-h-11 shrink-0 sm:w-auto"
          onClick={() => void run()}
          disabled={busy || !online || query.trim().length < 2}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
          {busy ? "Searching RSS…" : "Fetch live news"}
        </Button>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
        Public RSS only · no API key · Google News then Bing · article bodies not fetched · site terms apply.
      </p>

      {error ? (
        <p role="alert" className="mt-2 rounded-xl border border-destructive/25 bg-destructive/5 p-2.5 text-[10.5px] leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/35 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono-label text-[9px] text-muted-foreground">
              {result.provider} · “{result.query}” · {formatDateTime(result.retrievedAt)}
            </p>
            <Pill tone="neutral">{result.items.length} headlines</Pill>
          </div>
          <ul className="mt-2 space-y-2">
            {result.items.map((item) => (
              <li key={`${item.link}-${item.title}`} className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug text-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  <span className="min-w-0">{item.title}</span>
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {item.publisher || "Publisher not stated"}
                  {item.publishedAt ? ` · ${formatDate(item.publishedAt)}` : " · date not supplied"}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" className="tap min-h-10" onClick={add} disabled={added}>
              {added ? <Plus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {added ? "Added to this workspace" : `Add ${result.signals.length} live signals`}
            </Button>
            <span className="text-[10px] leading-relaxed text-muted-foreground">
              Headline-only signals. Review before using them in a brief or outreach.
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
