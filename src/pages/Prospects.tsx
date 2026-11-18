import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Radar,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { PROSPECTS, PUBLIC_SNAPSHOT_DATE, prospectScore, type Prospect, type ProspectSource } from "@/aurfy/prospects";
import { PROVENANCE_LABEL, formatDate, hostOf, initials } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { Button } from "@/components/ui/button";
import { Pill, TruthNote } from "@/components/aurfy/ui-bits";
import { LiveLookup } from "@/components/aurfy/live-lookup";

type SourceFilter = "all" | ProspectSource;

const normalize = (value: string) => value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");

const sourcePill = (source: ProspectSource) =>
  source === "public" ? (
    <Pill tone="primary" icon={Globe}>
      Public snapshot
    </Pill>
  ) : (
    <Pill tone="warning" icon={Sparkles}>
      Clay simulation
    </Pill>
  );

export default function Prospects() {
  const { state, addSourcedMerchant, setActiveMerchant } = useStudio();
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanVersion, setScanVersion] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const publicCount = PROSPECTS.filter((prospect) => prospect.source === "public").length;
  const clayCount = PROSPECTS.length - publicCount;

  const ranked = useMemo(() => {
    void scanVersion;
    const q = query.trim().toLowerCase();
    return PROSPECTS.map((prospect) => ({ ...prospect, ...prospectScore(prospect) }))
      .filter((prospect) => (sourceFilter === "all" ? true : prospect.source === sourceFilter))
      .filter((prospect) =>
        !q
          ? true
          : [prospect.name, prospect.category, prospect.summary, prospect.locations, ...prospect.channels]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort((a, b) => b.score - a.score);
    // scanVersion intentionally re-runs the deterministic ranking after a scan.
  }, [sourceFilter, query, scanVersion]);

  const findExisting = (prospect: Prospect) =>
    state.merchants.find(
      (merchant) =>
        (merchant.url && normalize(merchant.url) === normalize(prospect.url)) ||
        merchant.name.trim().toLowerCase() === prospect.name.trim().toLowerCase(),
    );

  const runScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setScanVersion((version) => version + 1);
      setLastScan(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      toast.success("Scan complete", {
        description: `${PROSPECTS.length} bundled records ranked: ${publicCount} public snapshots and ${clayCount} Clay simulations.`,
      });
    }, 700);
  };

  const importProspect = (prospect: Prospect) => {
    const existing = findExisting(prospect);
    if (existing) {
      setActiveMerchant(existing.id);
      navigate("/signals");
      toast.info("Opening the existing workspace", { description: `${prospect.name} is already in this browser.` });
      return;
    }

    const publicSignals = prospect.signals.filter((signal) => signal.provenance === "public").length;
    const claySignals = prospect.signals.filter((signal) => signal.provenance === "clay").length;
    const notes =
      prospect.source === "public"
        ? `Public snapshot read ${formatDate(PUBLIC_SNAPSHOT_DATE)} from ${prospect.sourceUrls.join(", ")}. Not independently audited; no partnership exists. Do not use a real logo without permission.`
        : "Sourced from a simulated Clay payload. The company, enrichment and signals are synthetic; no real Clay integration or merchant exists.";

    const result = addSourcedMerchant({
      logoUrl: prospect.logo,
      name: prospect.name,
      url: prospect.url,
      category: prospect.category,
      notes,
      recordSource: prospect.source,
      signals: prospect.signals,
    });

    if (!result.created) {
      toast.info("Already in the workspace", { description: "Opening the existing record instead of creating a duplicate." });
    } else {
      toast.success(`${prospect.name} added to the workspace`, {
        description: `${result.signalCount} signals imported${
          publicSignals ? ` · ${publicSignals} public` : ""
        }${claySignals ? ` · ${claySignals} simulated` : ""}. Review every source before using it.`,
      });
    }
    navigate("/signals");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Prospect engine"
        title="New co-brands, surfaced."
        description="Pull any real public company page on demand, fetch current public headlines, or scan a small bundled dataset. Sourced and simulated records keep their own labels."
        action={
          <Button asChild variant="outline" className="tap min-h-11">
            <Link to="/intake">
              <Plus className="h-4 w-4" />
              Add manually
            </Link>
          </Button>
        }
      />

      <LiveLookup />

      <TruthNote tone="demo" title="Bundled snapshot + simulated Clay">
        The scan below uses three public snapshot records read on {formatDate(PUBLIC_SNAPSHOT_DATE)} and three synthetic Clay records.
        The live lookup above is the on-demand path for new public pages and headlines. No Clay account, API key, LinkedIn access or
        scheduled enrichment runs here. Fit scores are deterministic rules, not predictions.
      </TruthNote>

      <section className="surface p-4 sm:p-5" aria-label="Prospect scan controls">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono-label text-[9px] text-primary">Bundled prospect scan</p>
            <p className="mt-1 text-[15px] font-semibold text-foreground">
              {ranked.length} of {PROSPECTS.length} candidates
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {publicCount} public snapshots · {clayCount} Clay simulations · ranked on load
            </p>
          </div>
          <Button type="button" className="tap min-h-11" onClick={runScan} disabled={scanning}>
            {scanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            {scanning ? "Scanning records…" : "Run scan"}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-full border border-border bg-muted/50 p-1" role="group" aria-label="Filter prospects by source">
          {(
            [
              { value: "all" as const, label: "All", count: PROSPECTS.length },
              { value: "public" as const, label: "Public", count: publicCount },
              { value: "clay_simulated" as const, label: "Clay", count: clayCount },
            ] satisfies { value: SourceFilter; label: string; count: number }[]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sourceFilter === option.value}
              onClick={() => setSourceFilter(option.value)}
              className={cn(
                "flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition",
                sourceFilter === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
              <span className={cn("font-mono text-[10px]", sourceFilter === option.value ? "text-primary" : "text-muted-foreground/70")}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label htmlFor="prospect-search" className="sr-only">
            Search prospects
          </label>
          <input
            id="prospect-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="aurfy-input"
            placeholder="Search company, category, footprint…"
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-[10.5px] text-muted-foreground">
          <span>{scanning ? "Re-ranking the bundled records…" : lastScan ? `Last scan ${lastScan}` : "Auto-ranked on load"}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", scanning ? "animate-pulse bg-primary" : "bg-success")} />
            {scanning ? "Working locally" : "Bundled data only"}
          </span>
        </div>

        <details className="group mt-2.5 border-t border-border/70 pt-2.5">
          <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-[11px] font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
            How the fit score works
            <ArrowRight className="h-3.5 w-3.5 transition group-open:rotate-90" aria-hidden="true" />
          </summary>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
            Each record earns points for three or more customer channels, a multi-location or pop-up footprint, a consumer retail
            category, both customer and peer signal lenses, and publicly sourced signals. A synthetic Clay record is flagged in the
            result. Scores are rule-based and deliberately not presented as propensity or intent predictions.
          </p>
        </details>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {ranked.map((prospect) => {
          const existing = findExisting(prospect);
          const sourceLinks = prospect.sourceUrls;
          return (
            <article key={prospect.key} className="surface flex flex-col overflow-hidden p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {sourcePill(prospect.source)}
                  {existing ? <Pill tone="success">In workspace</Pill> : <Pill tone="neutral">New</Pill>}
                </div>
                <div className="text-right">
                  <p className="font-display text-[30px] leading-none text-foreground">{prospect.score}</p>
                  <p className="mt-0.5 font-mono-label text-[8px] text-muted-foreground">rule fit</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                <span
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
                  aria-hidden="true"
                >
                  <span className="text-[10px] font-bold text-ink-soft">{initials(prospect.name)}</span>
                  {prospect.logo ? (
                    <img
                      src={prospect.logo}
                      alt=""
                      className="absolute inset-0 h-full w-full object-contain p-1"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </span>
                <h2 className="text-[18px] font-semibold leading-tight tracking-tight text-foreground">{prospect.name}</h2>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted-foreground">
                {prospect.source === "public" ? (
                  <a
                    href={prospect.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {hostOf(prospect.url)}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="font-mono text-[10px]">{prospect.url.replace(/^https?:\/\//, "")}</span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {prospect.locations}
                </span>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{prospect.summary}</p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Pill tone="outline">{prospect.category}</Pill>
                {prospect.channels.slice(0, 3).map((channel) => (
                  <Pill key={channel} tone="neutral">
                    {channel}
                  </Pill>
                ))}
                {prospect.channels.length > 3 ? <Pill tone="neutral">+{prospect.channels.length - 3}</Pill> : null}
              </div>

              <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
                <p className="font-mono-label text-[8.5px] text-muted-foreground">Why it surfaced</p>
                <ul className="mt-1.5 space-y-1">
                  {prospect.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {sourceLinks.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="font-semibold text-muted-foreground">Sources read {formatDate(PUBLIC_SNAPSHOT_DATE)}:</span>
                  {sourceLinks.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
                    >
                      <span className="max-w-[13rem] truncate">{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : null}

              <details className="group mt-3 rounded-xl border border-border bg-card">
                <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-xl px-3 text-[11px] font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
                  {prospect.signals.length} signals ready to import
                  <ArrowRight className="h-3.5 w-3.5 transition group-open:rotate-90" aria-hidden="true" />
                </summary>
                <ul className="space-y-2 border-t border-border/70 p-3">
                  {prospect.signals.map((signal) => (
                    <li key={signal.title} className="rounded-lg border border-border/70 bg-background/60 p-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill tone={signal.category === "customer" ? "primary" : "neutral"}>
                          {signal.category === "customer" ? "Customer" : "Peer"}
                        </Pill>
                        <Pill tone={signal.provenance === "public" ? "primary" : "warning"}>{PROVENANCE_LABEL[signal.provenance]}</Pill>
                      </div>
                      <p className="mt-1.5 text-[11.5px] font-semibold leading-snug text-foreground">{signal.title}</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                        {signal.provenance === "public"
                          ? `${signal.sourceName} · read ${formatDate(signal.retrievedAt)}`
                          : "Synthetic Clay record — no real source page or date."}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>

              {prospect.clayFields ? (
                <details className="group mt-2 rounded-xl border border-warning/25 bg-warning-soft/35">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-xl px-3 text-[11px] font-semibold text-warning [&::-webkit-details-marker]:hidden">
                    Clay-style enrichment · simulated
                    <ArrowRight className="h-3.5 w-3.5 transition group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-warning/20 p-3 text-[10px] leading-snug">
                    <div>
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Employees</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.employees}</dd>
                    </div>
                    <div>
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Locations</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.locations}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Tech stack</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.techStack.join(" · ")}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Intent topics</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.intentTopics.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Contact role</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.contactRole}</dd>
                    </div>
                    <div>
                      <dt className="font-mono-label text-[8px] text-muted-foreground">Recent event</dt>
                      <dd className="mt-0.5 text-ink-soft">{prospect.clayFields.recentEvent}</dd>
                    </div>
                  </dl>
                </details>
              ) : null}

              <div className="mt-auto pt-3">
                <Button type="button" className="tap min-h-11 w-full" onClick={() => importProspect(prospect)}>
                  {existing ? "Open workspace & signals" : "Add workspace & import signals"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-1.5 text-[9.5px] leading-relaxed text-muted-foreground">
                  {prospect.source === "public"
                    ? "Real prospect data from public pages. No logo is supplied — use a monogram or upload one with permission."
                    : "Synthetic company and signals. Adding it demonstrates the Clay path without implying a real Clay integration."}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {ranked.length === 0 ? (
        <div className="surface p-6 text-center text-sm text-muted-foreground">
          No bundled prospects match this filter. Clear the search or switch sources.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-3 text-[10.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          Public pages were read on {formatDate(PUBLIC_SNAPSHOT_DATE)} for this prototype. They are not re-fetched at runtime.
        </span>
        <Link to="/intake" className="font-semibold text-primary">
          Add a company manually
        </Link>
      </div>
    </div>
  );
}
