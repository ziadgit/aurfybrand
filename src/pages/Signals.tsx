import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Filter, Radar, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { DEMO_LIBRARY_NOTE } from "@/aurfy/demo";
import type { Confidence, SignalCategory, SignalStatus } from "@/aurfy/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { PasteSignalDialog } from "@/components/aurfy/paste-signal-dialog";
import { SignalCard } from "@/components/aurfy/signal-card";
import { LiveNewsPanel } from "@/components/aurfy/live-news-panel";
import { EmptyState, Pill, TruthNote } from "@/components/aurfy/ui-bits";

type CategoryFilter = "all" | SignalCategory;
type StatusFilter = "all" | SignalStatus;
type ConfidenceFilter = "all" | Confidence;
type ProvenanceFilter = "all" | "public" | "news" | "clay" | "demo" | "user";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "Not actioned" },
  { value: "selected", label: "Selected" },
  { value: "saved", label: "Saved" },
  { value: "rejected", label: "Rejected" },
];

const CONFIDENCE_OPTIONS: { value: ConfidenceFilter; label: string }[] = [
  { value: "all", label: "Any confidence" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const PROVENANCE_OPTIONS: { value: ProvenanceFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "public", label: "Public snapshot" },
  { value: "news", label: "Live news" },
  { value: "clay", label: "Clay simulation" },
  { value: "demo", label: "Demo library" },
  { value: "user", label: "Pasted by you" },
];

export default function Signals() {
  const { signals, selectedSignals, setSignalStatus, loadDemoSignals, merchant } = useStudio();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [confidence, setConfidence] = useState<ConfidenceFilter>("all");
  const [provenance, setProvenance] = useState<ProvenanceFilter>("all");

  const customerAll = signals.filter((signal) => signal.category === "customer").length;
  const peerAll = signals.filter((signal) => signal.category === "peer").length;
  const customerSelected = selectedSignals.filter((signal) => signal.category === "customer").length;
  const peerSelected = selectedSignals.filter((signal) => signal.category === "peer").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signals.filter((signal) => {
      if (category !== "all" && signal.category !== category) return false;
      if (status !== "all" && signal.status !== status) return false;
      if (confidence !== "all" && signal.confidence !== confidence) return false;
      if (provenance !== "all" && signal.provenance !== provenance) return false;
      if (!q) return true;
      return [signal.title, signal.sourceName, signal.evidence, signal.question, ...signal.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [signals, category, status, confidence, provenance, query]);

  const hasFilters = category !== "all" || status !== "all" || confidence !== "all" || provenance !== "all" || query.trim().length > 0;
  const clearFilters = () => {
    setCategory("all");
    setStatus("all");
    setConfidence("all");
    setProvenance("all");
    setQuery("");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        step={2}
        eyebrow="Signals feed"
        title="Evidence, with its limits attached."
        description="Two lenses, one working set. Select what you can stand behind, save what needs more work, reject what is too thin. Every card keeps its provenance visible."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <PasteSignalDialog />
          </div>
        }
      />

      <TruthNote tone="demo" title="Sources stay labeled">
        {DEMO_LIBRARY_NOTE} User-pasted text is labeled and never fetched. Public page lookups and live RSS headlines are opt-in and keep
        their source URLs and timestamps; Clay records are synthetic. There is no LinkedIn or social feed access.
      </TruthNote>

      {!merchant.isDemo && signals.length === 0 ? (
        <>
        <EmptyState
          icon={Radar}
          title="This workspace has no signals yet"
          description="New merchants start clean. Load the clearly labeled fictional library to try the workflow, or paste a public source you already have."
          action={
            <div className="space-y-2">
              <button
                type="button"
                className="tap w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const added = loadDemoSignals();
                  toast.success(`${added} fictional demo signals loaded`, {
                    description: "Every card is labeled demo and has no real source behind it.",
                  });
                }}
              >
                <Sparkles className="h-4 w-4" />
                Load fictional demo signals
              </button>
              <PasteSignalDialog triggerClassName="w-full" />
            </div>
          }
        />
        <LiveNewsPanel />
        </>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start">
            <div className="min-w-0">
              <section className="surface p-3 sm:p-4" aria-label="Signal filters">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="aurfy-input pl-10 pr-10"
                    placeholder="Search signals, sources, questions…"
                    aria-label="Search signals"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-border bg-muted/50 p-1" role="group" aria-label="Filter by signal lens">
                  {(
                    [
                      { value: "all" as const, label: "All", count: signals.length },
                      { value: "customer" as const, label: "Customer", count: customerAll },
                      { value: "peer" as const, label: "Peer", count: peerAll },
                    ]
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={category === option.value}
                      onClick={() => setCategory(option.value)}
                      className={cn(
                        "flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition",
                        category === option.value
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                      <span className={cn("font-mono text-[10px]", category === option.value ? "text-primary" : "text-muted-foreground/70")}>
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <label htmlFor="filter-status" className="font-mono-label mb-1.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Filter className="h-3 w-3" aria-hidden="true" />
                      Status
                    </label>
                    <select
                      id="filter-status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value as StatusFilter)}
                      className="aurfy-input h-11 min-h-11 py-2 pr-8 text-[13px]"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-provider" className="font-mono-label mb-1.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Radar className="h-3 w-3" aria-hidden="true" />
                      Source
                    </label>
                    <select
                      id="filter-provider"
                      value={provenance}
                      onChange={(event) => setProvenance(event.target.value as ProvenanceFilter)}
                      className="aurfy-input col-span-2 h-11 min-h-11 py-2 pr-8 text-[13px] sm:col-span-1"
                    >
                      {PROVENANCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-confidence" className="font-mono-label mb-1.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                      <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                      Confidence
                    </label>
                    <select
                      id="filter-confidence"
                      value={confidence}
                      onChange={(event) => setConfidence(event.target.value as ConfidenceFilter)}
                      className="aurfy-input h-11 min-h-11 py-2 pr-8 text-[13px]"
                    >
                      {CONFIDENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
                  <span role="status" aria-live="polite">
                    {filtered.length} of {signals.length} signals
                  </span>
                  {hasFilters ? (
                    <button type="button" onClick={clearFilters} className="inline-flex min-h-8 items-center gap-1 font-semibold text-primary">
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </section>

              <div className="mt-3 space-y-3">
                {filtered.map((signal, index) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    position={index + 1}
                    onStatusChange={(next) => {
                      setSignalStatus(signal.id, next);
                      if (next === "selected") {
                        toast.success("Signal selected", {
                          description: "It will be available to the brief, concept and outreach draft.",
                        });
                      }
                    }}
                  />
                ))}
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No signals match those filters"
                    description="Widen the lens, clear the search, or paste a public source of your own."
                    action={
                      <div className="space-y-2">
                        <button type="button" className="tap w-full border border-input bg-card" onClick={clearFilters}>
                          Clear filters
                        </button>
                        <PasteSignalDialog triggerClassName="w-full" />
                      </div>
                    }
                  />
                ) : null}
              </div>
            </div>

            <aside className="hidden space-y-3 lg:block" aria-label="Signal mix summary">
              <div className="surface p-4 lg:sticky lg:top-20">
                <p className="font-mono-label text-[9px] text-primary">Working set</p>
                <p className="mt-1.5 text-[15px] font-semibold text-foreground">
                  {selectedSignals.length} selected
                  {selectedSignals.length > 0 ? ` · ${customerSelected} customer / ${peerSelected} peer` : ""}
                </p>
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: "Customer behaviour", count: customerSelected, total: customerAll, bar: "bg-primary" },
                    { label: "Peer & competitor", count: peerSelected, total: peerAll, bar: "bg-accent-foreground/80" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-soft">{row.label}</span>
                        <span className="font-mono text-muted-foreground">
                          {row.count}
                          {row.total ? `/${row.total}` : ""}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", row.bar)} style={{ width: `${Math.min(100, (row.count / Math.max(1, row.total)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  {customerSelected > 0 && peerSelected > 0
                    ? "Both lenses present. The brief will separate observed evidence from inference."
                    : "Select at least one customer and one peer signal for a balanced read. The app does not enforce it, but flags it."}
                </p>
                <Link
                  to="/brief"
                  aria-disabled={selectedSignals.length === 0}
                  className={cn(
                    "tap mt-3 w-full",
                    selectedSignals.length > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "pointer-events-none border border-input bg-muted text-muted-foreground opacity-60",
                  )}
                >
                  Build the brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="surface p-4">
                <p className="font-mono-label text-[9px] text-muted-foreground">How to read a card</p>
                <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-ink-soft">
                  <li>
                    <span className="font-semibold text-foreground">Observed evidence</span> — the quoted or pasted material. Not a
                    market fact.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Why it might matter</span> — our inference, marked as such.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Novelty & limits</span> — why it is worth a conversation, and
                    what it cannot support.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Ask</span> — the question to bring to the merchant.
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Pill tone="warning">Demo · fabricated</Pill>
                  <Pill tone="outline">User · unverified</Pill>
                </div>
              </div>
            </aside>
          </div>

          {selectedSignals.length > 0 ? (
            <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-30 lg:hidden" role="region" aria-label="Selection summary">
              <Link
                to="/brief"
                className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-primary/20 bg-primary px-4 text-primary-foreground shadow-lift"
              >
                <Bookmark className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-[12px] leading-tight">
                  <span className="block font-semibold">{selectedSignals.length} signal{selectedSignals.length === 1 ? "" : "s"} selected</span>
                  <span className="block text-[10px] text-primary-foreground/70">
                    {customerSelected} customer · {peerSelected} peer
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold">
                  Brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          ) : null}

          {selectedSignals.length > 0 ? <div className="h-16 lg:hidden" aria-hidden="true" /> : null}

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-3 text-[11px] text-muted-foreground">
            <Radar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Filters run over signals already on this device. There is no refresh action because no retrieval service exists.
          </div>
        </>
      )}
    </div>
  );
}
