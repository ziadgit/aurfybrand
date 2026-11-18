import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  Globe,
  Loader2,
  Newspaper,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import {
  fetchLiveNews,
  fetchLivePage,
  type LiveNewsData,
  type LivePageData,
} from "@/aurfy/live-research";
import { PROVENANCE_LABEL, formatDateTime } from "@/aurfy/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill } from "./ui-bits";

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const suggestName = (data: LivePageData) => {
  const base = data.page.title.replace(/\s+[|–-]\s+.*$/, "").trim();
  if (base.length >= 2) return base.slice(0, 80);
  try {
    return new URL(data.page.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export function LiveLookup() {
  const { state, addSourcedMerchant, addSignalsToMerchant, setActiveMerchant } = useStudio();
  const online = useOnline();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState<LivePageData | null>(null);
  const [news, setNews] = useState<LiveNewsData | null>(null);
  const [busyPage, setBusyPage] = useState(false);
  const [busyNews, setBusyNews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeUrl(url);
  const existing = state.merchants.find((merchant) => {
    if (!url.trim()) return false;
    try {
      const left = merchant.url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      const right = normalized.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      return left === right || merchant.name.trim().toLowerCase() === name.trim().toLowerCase();
    } catch {
      return false;
    }
  });
  const signals = [...(page?.signals ?? []), ...(news?.signals ?? [])];
  const canAdd = Boolean(url.trim()) && signals.length > 0 && Boolean(name.trim() || page?.page.title);

  const fetchPage = async () => {
    if (!url.trim()) {
      setError("Paste a public company URL first.");
      return;
    }
    setBusyPage(true);
    setError(null);
    const outcome = await fetchLivePage(url);
    if (outcome.ok) {
      setPage(outcome.data);
      const suggested = suggestName(outcome.data);
      if (!name.trim() && suggested) setName(suggested);
    } else {
      setError(outcome.reason);
    }
    setBusyPage(false);
  };

  const fetchNews = async () => {
    const query = name.trim() || page?.page.title || (() => {
      try {
        return new URL(normalized).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })();
    if (!query) {
      setError("Add a company name or URL before fetching news.");
      return;
    }
    setBusyNews(true);
    setError(null);
    const outcome = await fetchLiveNews(query, 3);
    if (outcome.ok) {
      setNews(outcome.data);
    } else {
      setError(outcome.reason);
    }
    setBusyNews(false);
  };

  const add = () => {
    if (!canAdd) {
      setError("Fetch a page or news first, and add a company name and URL.");
      return;
    }
    const finalUrl = normalized;
    try {
      new URL(finalUrl);
    } catch {
      setError("That URL is not valid.");
      return;
    }
    const finalName = (name.trim() || page?.page.title || new URL(finalUrl).hostname.replace(/^www\./, "")).slice(0, 100);
    const signalsList = signals;
    const liveCount = signalsList.filter((signal) => signal.provenance === "news").length;
    const notes = [
      page ? `Live page fetched ${formatDateTime(page.fetchedAt)}: ${page.page.url}` : "",
      news ? `Live RSS headlines via ${news.provider} at ${formatDateTime(news.retrievedAt)} (article bodies not fetched).` : "",
      "Public live data; not independently audited. No partnership or logo is implied.",
    ]
      .filter(Boolean)
      .join(" ");

    if (existing) {
      const added = addSignalsToMerchant(existing.id, signalsList);
      setActiveMerchant(existing.id);
      navigate("/signals");
      toast.success(
        added > 0 ? `${added} live signals added to ${existing.name}` : `Live signals already present for ${existing.name}`,
        {
          description: added > 0 ? "Review the new public and news signals before selecting them." : "No duplicate signals were added.",
        },
      );
      return;
    }

    const result = addSourcedMerchant({
      logoUrl: page?.page.logoUrl ?? null,
      name: finalName,
      url: finalUrl,
      category: category.trim() || "Public prospect · live lookup",
      notes,
      recordSource: "public",
      signals: signalsList,
    });
    navigate("/signals");
    toast.success(`${finalName} added to the workspace`, {
      description: `${result.signalCount} live signals imported${liveCount ? ` · ${liveCount} news headlines` : ""}. Review every source before using it.`,
    });
  };

  return (
    <section className="surface border-primary/25 p-4 sm:p-5" aria-labelledby="live-lookup-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono-label text-[9px] text-primary">Live public research</p>
          <h2 id="live-lookup-title" className="mt-1 text-[16px] font-semibold text-foreground">
            Pull a real company page into the studio
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
            Fetch one public page server-side, extract observed channels and payment references, and add live RSS headlines. No login,
            no API key, no crawl.
          </p>
        </div>
        <Pill tone="primary" icon={Radar}>
          Live
        </Pill>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <Label htmlFor="live-url" className="field-label">
            Public company URL
          </Label>
          <Input
            id="live-url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setPage(null);
              setNews(null);
            }}
            className="aurfy-input"
            placeholder="https://company.com"
            inputMode="url"
            autoComplete="url"
          />
        </div>
        <div className="flex items-end">
          <Button type="button" className="tap min-h-12 w-full sm:w-auto" onClick={() => void fetchPage()} disabled={busyPage || !online || !url.trim()}>
            {busyPage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            {busyPage ? "Fetching page…" : "Fetch public page"}
          </Button>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <Label htmlFor="live-name" className="sr-only">
            Company name
          </Label>
          <Input
            id="live-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="aurfy-input"
            placeholder="Company name (suggested after fetch)"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="live-category" className="sr-only">
            Category
          </Label>
          <Input
            id="live-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="aurfy-input"
            placeholder="Category, e.g. specialty coffee"
            maxLength={90}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="tap min-h-10" onClick={() => void fetchNews()} disabled={busyNews || !online || (!name.trim() && !url.trim())}>
          {busyNews ? <Loader2 className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
          {busyNews ? "Searching news…" : "Fetch latest news"}
        </Button>
        <span className="text-[10px] leading-relaxed text-muted-foreground">
          Live RSS headlines · article bodies not fetched · site terms apply
        </span>
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        The fetch is one user-initiated public page with a 12-second limit. Login-protected, private or non-HTML pages are rejected; a
        site can refuse the request. Nothing is invented if it fails.
      </p>

      {!online ? (
        <p className="mt-2 rounded-xl border border-warning/25 bg-warning-soft/60 p-2.5 text-[10.5px] text-warning">
          Offline: live fetch and RSS search are unavailable.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 rounded-xl border border-destructive/25 bg-destructive/5 p-2.5 text-[10.5px] leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}

      {page || news ? (
        <div className="mt-3 space-y-2.5 rounded-xl border border-border bg-muted/30 p-3">
          {page ? (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-label text-[9px] text-primary">Live page · fetched {formatDateTime(page.fetchedAt)}</p>
                <a
                  href={page.page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-7 items-center gap-1 text-[10px] font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Open source
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                {page.page.logoUrl ? (
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                    <img
                      src={page.page.logoUrl}
                      alt=""
                      className="h-full w-full object-contain p-0.5"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </span>
                ) : null}
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">{page.page.title}</h3>
              </div>
              {page.page.description ? <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{page.page.description}</p> : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {page.page.channels.slice(0, 5).map((channel) => (
                  <Pill key={channel} tone="primary">
                    {channel}
                  </Pill>
                ))}
                {page.page.paymentTerms.slice(0, 3).map((term) => (
                  <Pill key={term} tone="outline">
                    {term}
                  </Pill>
                ))}
                {page.page.locationHint ? <Pill tone="neutral">{page.page.locationHint}</Pill> : null}
              </div>
              {page.page.warnings.length ? (
                <ul className="mt-2 space-y-0.5 text-[9.5px] leading-relaxed text-muted-foreground">
                  {page.page.warnings.map((warning) => (
                    <li key={warning}>· {warning}</li>
                  ))}
                </ul>
              ) : null}
              <details className="group mt-2 border-t border-border/70 pt-2">
                <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-[10.5px] font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
                  {page.signals.length} extracted live signals
                  <ArrowRight className="h-3.5 w-3.5 transition group-open:rotate-90" aria-hidden="true" />
                </summary>
                <ul className="mt-1.5 space-y-1.5">
                  {page.signals.map((signal) => (
                    <li key={signal.title} className="rounded-lg border border-border/70 bg-background/60 p-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill tone="primary">{PROVENANCE_LABEL[signal.provenance]}</Pill>
                        <span className="text-[9px] text-muted-foreground">{signal.category === "customer" ? "Customer" : "Peer"}</span>
                      </div>
                      <p className="mt-1 text-[10.5px] font-semibold leading-snug text-foreground">{signal.title}</p>
                      <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted-foreground">{signal.evidence.slice(0, 180)}…</p>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ) : null}

          {news ? (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-label text-[9px] text-primary">Live news · {news.provider}</p>
                <Pill tone="accent">{news.items.length} headlines</Pill>
              </div>
              <ul className="mt-2 space-y-1.5">
                {news.items.map((item) => (
                  <li key={`${item.link}-${item.title}`}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1.5 text-[11px] font-semibold leading-snug text-foreground underline-offset-2 hover:text-primary hover:underline"
                    >
                      <span className="min-w-0">{item.title}</span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                    <p className="mt-0.5 text-[9.5px] text-muted-foreground">
                      {item.publisher || "Publisher not stated"}
                      {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString("en-GB")}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[9.5px] leading-relaxed text-muted-foreground">
                Headlines only; article bodies were not fetched or verified.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" className="tap min-h-11" onClick={add} disabled={!canAdd}>
              <Sparkles className="h-4 w-4" />
              {existing ? "Add live signals to existing workspace" : `Add live prospect · ${signals.length} signals`}
            </Button>
            <span className="text-[10px] leading-relaxed text-muted-foreground">
              Name and category above are saved with the prospect. No logo is supplied.
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
