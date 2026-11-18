import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ExternalLink,
  ListChecks,
  Pause,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { buildFeed, findFeedMerchant, type FeedItem } from "@/aurfy/feed";
import { ANGLES, CONCEPT_FONTS, CONCEPT_PALETTES } from "@/aurfy/content";
import { clampText, formatDate, merchantSourceMeta } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { BrandLockup, BrandMark } from "@/components/aurfy/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pill } from "@/components/aurfy/ui-bits";

type Filter = "all" | "customer" | "peer" | "public" | "clay" | "demo";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All signals" },
  { id: "customer", label: "Customer" },
  { id: "peer", label: "Peer" },
  { id: "public", label: "Public" },
  { id: "clay", label: "Simulated" },
  { id: "demo", label: "Demo" },
];

function sourceDot(item: FeedItem) {
  if (item.source === "public") return "hsl(73 84% 62%)";
  if (item.source === "clay") return "hsl(18 78% 64%)";
  return "hsl(36 92% 68%)";
}

function feedFont(item: FeedItem) {
  return CONCEPT_FONTS.find((font) => font.id === item.fontId) ?? CONCEPT_FONTS[0];
}

function feedPalette(item: FeedItem) {
  return CONCEPT_PALETTES.find((palette) => palette.id === item.palette) ?? CONCEPT_PALETTES[0];
}

export default function SignalFeed() {
  const { state, queueCoBrand, dequeueCoBrand, setActiveMerchant } = useStudio();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);

  const items = useMemo(() => buildFeed(state), [state]);
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "all") return true;
        if (filter === "customer" || filter === "peer") return item.signal.category === filter;
        return item.source === filter;
      }),
    [items, filter],
  );

  const queued = useMemo(
    () =>
      state.merchants
        .map((merchant) => ({ merchant, pipeline: state.pipeline[merchant.id] }))
        .filter(({ pipeline }) => Boolean(pipeline?.queuedAt))
        .sort((a, b) => (b.pipeline?.queuedAt ?? "").localeCompare(a.pipeline?.queuedAt ?? "")),
    [state],
  );

  useEffect(() => {
    document.title = "Aurfy Signal Studio — Signal stream";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;
    setPlaying(!reduce && !touch);
  }, []);

  useEffect(() => {
    if (!playing || selected || queueOpen || hovering) return;
    const timer = window.setInterval(() => {
      const element = feedRef.current;
      if (!element) return;
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 4) {
        setPlaying(false);
        return;
      }
      element.scrollTop += 1;
    }, 45);
    return () => window.clearInterval(timer);
  }, [playing, selected, queueOpen, hovering]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [filter]);

  const merchantFor = (item: FeedItem) => findFeedMerchant(state, item);
  const isQueued = (item: FeedItem) => {
    const merchant = merchantFor(item);
    return Boolean(merchant && state.pipeline[merchant.id]?.queuedAt);
  };

  const queue = (item: FeedItem) => {
    const merchant = merchantFor(item);
    const prospect = item.prospect;
    const result = queueCoBrand({
      merchantId: item.merchantId,
      name: item.brand,
      url: prospect?.url ?? merchant?.url ?? "",
      category: item.category,
      notes:
        item.source === "demo"
          ? "Queued from the homepage signal stream. Fictional demo signal."
          : item.source === "clay"
            ? "Queued from the homepage signal stream. Simulated Clay record; company, enrichment and signals are synthetic."
            : "Queued from the homepage signal stream. Public snapshot; not independently audited. No partnership implied.",
      recordSource: item.source === "clay" ? "clay_simulated" : item.source === "public" ? "public" : "demo",
      isDemo: item.source === "demo",
      signalTitle: item.signal.title,
      signals: prospect?.signals ?? [],
    });
    setSelected(null);
    setQueueOpen(true);
    setPlaying(false);
    toast.success(result.created ? `${item.brand} queued for a co-brand` : "Co-brand queue updated", {
      description: "The selected signal is marked in the workspace. Nothing has been sent or published.",
    });
  };

  const openQueued = (merchantId: string) => {
    const merchant = state.merchants.find((entry) => entry.id === merchantId);
    if (!merchant) return;
    const positioning = state.positioning[merchantId];
    const ready = Boolean(positioning?.angle && (positioning.capabilityIds?.length ?? 0) > 0);
    setActiveMerchant(merchantId);
    dequeueCoBrand(merchantId);
    setQueueOpen(false);
    navigate(ready ? "/concept" : "/signals");
    toast.info(`Opening ${merchant.name}`, {
      description: ready ? "The co-brand is ready to edit." : "Start with the imported signals, then build the brief and positioning.",
    });
  };

  const removeQueued = (merchantId: string, name: string) => {
    dequeueCoBrand(merchantId);
    toast.success(`${name} removed from the queue`, { description: "The workspace and its signals remain available." });
  };

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden bg-[hsl(234_30%_8%)] text-primary-foreground"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/40 blur-3xl" />
        <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[34vw] font-normal leading-none text-primary-foreground/[0.035]">
          Aurfy
        </span>
      </div>

      <header className="safe-top relative z-30 border-b border-primary-foreground/10 px-4 py-3 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
          <Link to="/" aria-label="Aurfy Signal Studio home" className="rounded-xl">
            <BrandLockup compact inverted />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              to="/deck"
              className="hidden min-h-10 items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 text-[11px] font-semibold text-primary-foreground/85 transition hover:bg-primary-foreground/10 sm:inline-flex"
            >
              Deck
            </Link>
            <Link
              to="/more"
              className="inline-flex min-h-10 items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 text-[11px] font-semibold text-primary-foreground/85 transition hover:bg-primary-foreground/10"
            >
              More
            </Link>
            <button
              type="button"
              onClick={() => {
                setQueueOpen(true);
                setPlaying(false);
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-accent px-3 text-[11px] font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              Queue
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-foreground/15 px-1 text-[10px]">
                {queued.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-20 mx-auto w-full max-w-6xl shrink-0 px-4 pt-4 sm:px-8 sm:pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono-label text-[9px] text-accent">Signal stream · public + simulated</p>
            <h1 className="mt-1 font-display text-[26px] leading-[1.02] text-primary-foreground sm:text-[34px]">
              Brands, between the lines.
            </h1>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-primary-foreground/55">
              A curated stream of observed merchant signals, not a social feed. Every source is labeled. Tap any line to queue a
              co-brand.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!playing) {
                const element = feedRef.current;
                if (element && element.scrollTop + element.clientHeight >= element.scrollHeight - 8) {
                  element.scrollTo({ top: 0, behavior: "smooth" });
                }
                setPlaying(true);
              } else {
                setPlaying(false);
              }
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 text-[10.5px] font-medium text-primary-foreground/75 transition hover:bg-primary-foreground/10"
            aria-label={playing ? "Pause auto-scroll" : "Start auto-scroll"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "Pause stream" : "Play stream"}
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-2" role="group" aria-label="Filter signal stream">
          {FILTERS.map((option) => {
            const active = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "min-h-9 shrink-0 rounded-full border px-3 text-[10.5px] font-semibold transition",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-primary-foreground/15 bg-primary-foreground/5 text-primary-foreground/60 hover:text-primary-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div
        ref={feedRef}
        className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto"
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={() => setHovering(false)}
        onWheel={() => setPlaying(false)}
        onTouchStart={() => setPlaying(false)}
      >
        <div className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-8">
          {filtered.map((item) => {
            const font = feedFont(item);
            const palette = feedPalette(item);
            const queuedItem = isQueued(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelected(item);
                  setPlaying(false);
                }}
                className="group block w-full border-b border-primary-foreground/10 py-6 text-left transition hover:border-accent/40 hover:bg-primary-foreground/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:py-7"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1"
                    style={{ background: "hsl(45 40% 97%)" }}
                  >
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-bold" style={{ color: "hsl(234 30% 15%)" }}>
                        {item.initials}
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: palette.accent }}>
                    {item.brand}
                  </span>
                  <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-2.5 text-[9px] font-medium text-primary-foreground/65">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: sourceDot(item) }} aria-hidden="true" />
                    {item.sourceLabel}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-primary-foreground/35">{item.categoryLabel}</span>
                  {queuedItem ? (
                    <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-accent px-2.5 text-[9px] font-bold text-accent-foreground">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Queued
                    </span>
                  ) : null}
                </div>

                <p
                  className="mt-3 max-w-[30ch] text-[24px] leading-[1.06] text-primary-foreground sm:text-[32px]"
                  style={{ fontFamily: font.stack, fontWeight: font.weight }}
                >
                  {item.signal.title}
                </p>

                <div className="mt-2 flex items-start justify-between gap-4">
                  <p className="max-w-[58ch] text-[11px] leading-relaxed text-primary-foreground/50">
                    {clampText(item.signal.whyItMatters, 150)}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-accent opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    Queue co-brand
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-primary-foreground">No signals in this lens.</p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-3 inline-flex min-h-10 items-center rounded-full border border-primary-foreground/20 px-4 text-[11px] font-semibold text-primary-foreground/80"
              >
                Show all signals
              </button>
            </div>
          ) : null}
          <div className="flex items-center justify-center gap-2 py-10 text-[10px] text-primary-foreground/35">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Public snapshots, simulated Clay records and fictional demos are labeled above.
          </div>
        </div>
      </div>

      <div className="safe-bottom relative z-30 border-t border-primary-foreground/10 bg-[hsl(234_30%_9%)]/90 px-4 py-2.5 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          {queued.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQueueOpen(true);
                setPlaying(false);
              }}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-accent px-4 text-left text-accent-foreground transition hover:bg-accent/90"
            >
              <span className="flex min-w-0 items-center gap-2">
                <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate text-[12px] font-semibold">
                  {queued.length} co-brand{queued.length === 1 ? "" : "s"} queued
                </span>
                <span className="hidden truncate text-[10px] opacity-65 sm:block">Review and open the queue</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex min-h-11 w-full items-center justify-between gap-2 text-[10.5px] text-primary-foreground/50">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Tap a signal to queue a co-brand.
              </span>
              <span className="hidden sm:inline">Queueing creates a local workspace; nothing is sent.</span>
            </div>
          )}
        </div>
      </div>

      {/* Signal detail + queue action */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl p-1"
                    style={{ background: "hsl(45 40% 97%)" }}
                  >
                    {selected.logoUrl ? (
                      <img src={selected.logoUrl} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold" style={{ color: "hsl(234 30% 15%)" }}>
                        {selected.initials}
                      </span>
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.brand}</p>
                    <p className="text-[10.5px] text-muted-foreground">{selected.category}</p>
                  </div>
                </div>
                <DialogTitle className="mt-3 font-display text-[26px] leading-[1.08]">{selected.signal.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Pill tone={selected.source === "public" ? "primary" : selected.source === "clay" ? "warning" : "warning"}>
                    {selected.sourceLabel}
                  </Pill>
                  <Pill tone="neutral">{selected.categoryLabel}</Pill>
                  <Pill tone="outline">
                    {ANGLES.find((angle) => angle.id === selected.angle)?.label ?? "Connected commerce"} angle suggested
                  </Pill>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="rounded-xl border-l-2 border-primary/40 bg-secondary/50 px-3 py-2.5">
                  <p className="font-mono-label text-[9px] text-primary">Observed evidence</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{selected.signal.evidence}</p>
                </div>
                <div className="rounded-xl border border-dashed border-warning/35 bg-warning-soft/40 px-3 py-2.5">
                  <p className="font-mono-label text-[9px] text-warning">Why it might matter · inference</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{selected.signal.whyItMatters}</p>
                </div>
                <div>
                  <p className="font-mono-label text-[9px] text-muted-foreground">Source & limits</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {selected.signal.sourceName}
                    {selected.signal.sourceDate ? ` · published ${formatDate(selected.signal.sourceDate)}` : ""}
                    {selected.signal.retrievedAt ? ` · read ${formatDate(selected.signal.retrievedAt)}` : ""}. {selected.signal.limitations}
                  </p>
                  {selected.prospect && selected.source === "public" ? (
                    <a
                      href={selected.signal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Open source page
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Ask the merchant: </span>
                  {selected.signal.question}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {isQueued(selected) ? (
                  <Button
                    type="button"
                    className="tap min-h-11"
                    onClick={() => {
                      setSelected(null);
                      setQueueOpen(true);
                    }}
                  >
                    View co-brand queue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" className="tap min-h-11" onClick={() => queue(selected)}>
                    <Radar className="h-4 w-4" />
                    Queue this co-brand
                  </Button>
                )}
                <Button type="button" variant="outline" className="tap min-h-11" onClick={() => setSelected(null)}>
                  Keep browsing
                </Button>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Queueing creates a local workspace and selects this signal. No outreach, post or partnership action happens automatically.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Co-brand queue */}
      <Dialog open={queueOpen} onOpenChange={setQueueOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Co-brand queue</DialogTitle>
            <DialogDescription>
              Queued in this browser. Open one to start its workspace; nothing is sent or published.
            </DialogDescription>
          </DialogHeader>

          {queued.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              The queue is empty. Tap a signal in the stream to add a co-brand.
            </div>
          ) : (
            <ul className="space-y-2">
              {queued.map(({ merchant, pipeline }) => {
                const meta = merchantSourceMeta(merchant);
                return (
                  <li key={merchant.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">{merchant.name}</p>
                        <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">{merchant.category}</p>
                      </div>
                      <Pill tone={meta.tone}>{meta.label}</Pill>
                    </div>
                    {pipeline?.queuedSignal ? (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">
                        <span className="font-semibold">Signal: </span>
                        {pipeline.queuedSignal}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" size="sm" className="min-h-9" onClick={() => openQueued(merchant.id)}>
                        Open workspace
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="min-h-9 text-muted-foreground"
                        onClick={() => removeQueued(merchant.id, merchant.name)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Button asChild variant="outline" className="min-h-10">
            <Link to="/prospects">
              <Radar className="h-4 w-4" />
              Pull a live company page
            </Link>
          </Button>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Public and live sources are labeled; Clay records are simulated. Queueing is a local action only.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
