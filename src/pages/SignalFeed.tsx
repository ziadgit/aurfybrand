import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ExternalLink,
  ListChecks,
  Menu,
  Pause,
  Play,
  Plus,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { buildFeed, findFeedMerchant, type FeedItem } from "@/aurfy/feed";
import { ANGLES, CONCEPT_PALETTES } from "@/aurfy/content";
import { formatDate, hostOf, merchantSourceMeta } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/aurfy/brand";
import { BoardGallery } from "@/components/aurfy/board-gallery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pill } from "@/components/aurfy/ui-bits";

type ViewMode = "stream" | "boards";
type StreamEntry = { key: string; item: FeedItem; arrivedAt: number; isNewBrand: boolean };

const STARS = Array.from({ length: 86 }, (_, index) => ({
  left: ((index * 47) % 997) / 10,
  top: ((index * 79 + 17) % 991) / 10,
  size: index % 13 === 0 ? 2.4 : index % 5 === 0 ? 1.6 : 1,
  delay: (index % 11) * 0.55,
  opacity: 0.18 + (index % 5) * 0.1,
}));

function makeInitial(pool: FeedItem[]): StreamEntry[] {
  const start = Date.now();
  const distinct: FeedItem[] = [];
  const seenBrands = new Set<string>();
  for (const item of pool) {
    if (seenBrands.has(item.brand)) continue;
    seenBrands.add(item.brand);
    distinct.push(item);
    if (distinct.length >= 6) break;
  }
  const chosen = distinct.length >= 6 ? distinct : pool.slice(0, 6);
  return chosen.map((item, index) => ({
    key: `${item.id}_init_${index}`,
    item,
    arrivedAt: start - (chosen.length - index) * 42000,
    isNewBrand: false,
  }));
}

function pickNext(pool: FeedItem[], cursor: number, visible: StreamEntry[]) {
  const visibleBrands = new Set(visible.map((entry) => entry.item.brand));
  const unseen = pool.filter((item) => !visibleBrands.has(item.brand));
  const candidates = unseen.length > 0 ? unseen : pool;
  const recentBrands = new Set(visible.slice(-4).map((entry) => entry.item.brand));
  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = candidates[(cursor + offset) % candidates.length];
    if (!recentBrands.has(candidate.brand) || unseen.length > 0) {
      return {
        item: candidate,
        cursor: (cursor + offset + 1) % candidates.length,
        isNewBrand: !visibleBrands.has(candidate.brand),
      };
    }
  }
  const candidate = candidates[cursor % candidates.length];
  return {
    item: candidate,
    cursor: (cursor + 1) % candidates.length,
    isNewBrand: !visibleBrands.has(candidate.brand),
  };
}

function timeAgo(at: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - at) / 1000));
  if (seconds < 12) return "just now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function sourceDot(source: FeedItem["source"]) {
  if (source === "public") return "hsl(73 84% 62%)";
  if (source === "clay") return "hsl(18 78% 64%)";
  return "hsl(36 92% 68%)";
}

function feedHandles(item: FeedItem) {
  if (item.prospect) return hostOf(item.prospect.url);
  return item.source === "demo" ? "demo signal" : "simulated record";
}

function Cosmos() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 8%, hsla(266,70%,40%,0.32) 0%, transparent 55%), radial-gradient(90% 70% at 10% 105%, hsla(178,60%,26%,0.28) 0%, transparent 60%), linear-gradient(180deg, #05050c 0%, #080713 55%, #05050a 100%)",
        }}
      />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="cosmos-star absolute rounded-full bg-primary-foreground"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      <div
        className="absolute -right-36 -top-40 h-[30rem] w-[30rem] rounded-full opacity-60 sm:-right-20 sm:-top-48 sm:h-[38rem] sm:w-[38rem]"
        style={{
          background: "radial-gradient(circle at 34% 30%, hsl(258 60% 34%) 0%, hsl(258 55% 18%) 42%, hsl(240 50% 7%) 72%)",
          boxShadow: "inset -40px -30px 80px hsl(240 60% 4% / 0.9), 0 0 90px hsl(258 80% 45% / 0.18)",
        }}
      />
      <div className="cosmos-orbit absolute -right-24 -top-24 h-[24rem] w-[38rem] rounded-[50%] border border-primary-foreground/10 sm:-right-10 sm:-top-20 sm:h-[30rem] sm:w-[48rem]" />
      <div className="cosmos-orbit absolute -left-40 bottom-[-14rem] h-[30rem] w-[30rem] rounded-full border border-accent/10">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent/70" />
      </div>
      <div className="cosmos-shoot absolute right-[18%] top-[22%] h-px w-44 bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent" />
      <svg className="absolute -bottom-24 -left-24 h-[26rem] w-[26rem] opacity-[0.08]" viewBox="0 0 200 200" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5">
        <path d="M30 160a60 60 0 0 1 60-60" />
        <path d="M30 118a102 102 0 0 1 102 102" />
        <path d="M30 76a144 144 0 0 1 144 144" />
      </svg>
    </div>
  );
}


export default function SignalFeed() {
  const { state, queueCoBrand, dequeueCoBrand, setActiveMerchant } = useStudio();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const canAutoRef = useRef(false);
  const [mode, setMode] = useState<ViewMode>("boards");
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [pendingNew, setPendingNew] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [stream, setStream] = useState(() => {
    const pool = buildFeed(state);
    return { pool, visible: makeInitial(pool), cursor: Math.min(6, pool.length) };
  });

  const items = useMemo(() => buildFeed(state), [state]);

  const queued = useMemo(
    () =>
      state.merchants
        .map((merchant) => ({ merchant, pipeline: state.pipeline[merchant.id] }))
        .filter(({ pipeline }) => Boolean(pipeline?.queuedAt))
        .sort((a, b) => (b.pipeline?.queuedAt ?? "").localeCompare(a.pipeline?.queuedAt ?? "")),
    [state],
  );

  useEffect(() => {
    document.title = "Aurfy — signal universe";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    canAutoRef.current = !reduce && hover;
    setAutoScroll(canAutoRef.current);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(tick);
  }, []);

  // New surfaces keep arriving from the labeled pool. This is a presentation
  // simulation, not live social listening.
  useEffect(() => {
    if (mode !== "stream" || !playing || selected || queueOpen || menuOpen) return;
    const timer = window.setInterval(() => {
      setStream((current) => {
        if (current.pool.length === 0) return current;
        const next = pickNext(current.pool, current.cursor, current.visible);
        const entry: StreamEntry = {
          key: `${next.item.id}_${Date.now()}`,
          item: next.item,
          arrivedAt: Date.now(),
          isNewBrand: next.isNewBrand,
        };
        return {
          pool: current.pool,
          cursor: next.cursor,
          visible: [...current.visible, entry].slice(-16),
        };
      });
      setPendingNew((count) => count + 1);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [mode, playing, selected, queueOpen, menuOpen]);

  useEffect(() => {
    if (mode !== "stream" || !playing || !autoScroll || selected || queueOpen || menuOpen || focusPaused) return;
    const timer = window.setInterval(() => {
      const element = feedRef.current;
      if (!element) return;
      element.scrollTop += 1;
    }, 45);
    return () => window.clearInterval(timer);
  }, [mode, playing, autoScroll, selected, queueOpen, menuOpen, focusPaused]);

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
      logoUrl: item.prospect?.logo ?? null,
      name: item.brand,
      url: prospect?.url ?? merchant?.url ?? "",
      category: item.category,
      notes:
        item.source === "demo"
          ? "Queued from the signal universe. Fictional demo signal."
          : item.source === "clay"
            ? "Queued from the signal universe. Simulated Clay record; company, enrichment and signals are synthetic."
            : "Queued from the signal universe. Public snapshot; not independently audited. No partnership implied.",
      recordSource: item.source === "clay" ? "clay_simulated" : item.source === "public" ? "public" : "demo",
      isDemo: item.source === "demo",
      signalTitle: item.signal.title,
      signals: prospect?.signals ?? [],
    });
    setSelected(null);
    setQueueOpen(true);
    setPlaying(false);
    setAutoScroll(false);
    toast.success(result.created ? `${item.brand} queued for a co-brand` : "Co-brand queue updated", {
      description: "The signal is marked in the workspace. Nothing has been sent or published.",
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

  const togglePlaying = () => {
    if (playing) {
      setPlaying(false);
      setAutoScroll(false);
      return;
    }
    const element = feedRef.current;
    if (element && element.scrollTop + element.clientHeight >= element.scrollHeight - 8) {
      element.scrollTo({ top: 0, behavior: "smooth" });
    }
    setPlaying(true);
    setAutoScroll(canAutoRef.current);
  };

  const jumpToNew = () => {
    const element = feedRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    setPendingNew(0);
  };

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-cosmos text-primary-foreground">
      <Cosmos />

      <header className="safe-top relative z-30 flex items-center gap-2.5 px-4 pb-1 pt-3 sm:px-6">
        <Link to="/" aria-label="Aurfy signal universe" className="flex items-center gap-2 rounded-xl">
          <BrandMark className="h-7 w-7" />
          <span className="flex flex-col leading-none">
            <span className="text-[12px] font-semibold tracking-tight text-primary-foreground">Aurfy</span>
            <span className="font-mono-label mt-0.5 text-[7px] text-primary-foreground/40">signal universe</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground/60 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Open Aurfy menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative z-20 flex items-center gap-2 px-4 pb-3 sm:px-6">
        <div className="flex shrink-0 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 p-0.5">
          <button
            type="button"
            aria-pressed={mode === "boards"}
            onClick={() => switchMode("boards")}
            className={cn(
              "inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[9.5px] font-semibold capitalize transition",
              mode === "boards" ? "bg-primary-foreground/10 text-primary-foreground" : "text-primary-foreground/40 hover:text-primary-foreground/70",
            )}
          >
            co-brands
            <span className={cn("rounded-full px-1 text-[8px]", mode === "boards" ? "bg-accent/20 text-accent" : "text-primary-foreground/30")}>
              {boards.length}
            </span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "stream"}
            onClick={() => switchMode("stream")}
            className={cn(
              "inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-[9.5px] font-semibold capitalize transition",
              mode === "stream" ? "bg-primary-foreground/10 text-primary-foreground" : "text-primary-foreground/40 hover:text-primary-foreground/70",
            )}
          >
            stream
          </button>
        </div>

        {mode === "stream" ? (
          <button
            type="button"
            onClick={togglePlaying}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/50 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label={playing ? "Pause stream" : "Play stream"}
            title={playing ? "Pause stream" : "Play stream"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        ) : null}

      </div>

      <main
        ref={feedRef}
        className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto"
        onFocusCapture={() => setFocusPaused(true)}
        onBlurCapture={() => setFocusPaused(false)}
        onWheel={() => setAutoScroll(false)}
        onScroll={() => {
          const element = feedRef.current;
          if (element && element.scrollHeight - element.scrollTop - element.clientHeight < 90) {
            setPendingNew(0);
          }
        }}
      >
        {mode === "stream" ? (
        <div className="mx-auto w-full max-w-2xl px-4 pb-40 pt-1 sm:px-6">
          {stream.visible.map((entry) => {
            const item = entry.item;
            const palette = CONCEPT_PALETTES.find((option) => option.id === item.palette) ?? CONCEPT_PALETTES[0];
            const fresh = now - entry.arrivedAt < 16000;
            const queuedItem = isQueued(item);
            return (
              <article
                key={entry.key}
                className={cn(
                  "group relative border-b border-primary-foreground/[0.075] py-5",
                  fresh && "cosmos-arrive",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-primary-foreground/15"
                    style={{ background: palette.panel }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: palette.ink }}>
                      {item.initials}
                    </span>
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full rounded-full object-contain p-0.5"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="text-[13px] font-semibold leading-tight" style={{ color: palette.accent }}>
                        {item.brand}
                      </span>
                      {entry.isNewBrand ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-accent">
                          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                          new brand
                        </span>
                      ) : null}
                      <span className="text-[9.5px] text-primary-foreground/40">· {timeAgo(entry.arrivedAt, now)}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-primary-foreground/40">
                      <span className="truncate">{feedHandles(item)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full" style={{ background: sourceDot(item.source) }} aria-hidden="true" />
                        {item.sourceLabel}
                      </span>
                      {queuedItem ? <span className="text-accent/80">· queued</span> : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setPlaying(false);
                        setAutoScroll(false);
                      }}
                      className="mt-2 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      <p className="text-[20px] font-medium leading-[1.3] tracking-[-0.01em] text-primary-foreground/90 sm:text-[23px]">
                        {item.signal.title}
                      </p>
                      <p className="mt-1.5 line-clamp-2 max-w-[52ch] text-[11px] leading-relaxed text-primary-foreground/45">
                        {item.signal.whyItMatters}
                      </p>
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
                      <button
                        type="button"
                        onClick={() => queue(item)}
                        className="inline-flex min-h-10 items-center gap-1 font-semibold text-accent transition hover:text-accent/80"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Queue co-brand
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setPlaying(false);
                          setAutoScroll(false);
                        }}
                        className="inline-flex min-h-9 items-center gap-1 text-primary-foreground/40 transition hover:text-primary-foreground/70"
                      >
                        Details
                      </button>
                      {fresh ? (
                        <span className="ml-auto inline-flex items-center gap-1 text-[8.5px] uppercase tracking-[0.12em] text-accent/70">
                          <span className="animate-pulse h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                          just arrived
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {stream.visible.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="font-display text-2xl text-primary-foreground">Nothing in this orbit yet.</p>
              <button
                type="button"
                onClick={() => switchMode("boards")}
                className="mt-3 inline-flex min-h-10 items-center rounded-full border border-primary-foreground/15 px-4 text-[11px] font-semibold text-primary-foreground/70"
              >
                Back to co-brand boards
              </button>
            </div>
          ) : null}
          <div className="flex flex-col items-center gap-1.5 py-10 text-center text-[9px] leading-relaxed text-primary-foreground/35">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Public snapshots · simulated Clay · fictional demos
            </span>
            <span>Arrival timing and new-brand surfacing are a demo simulation; sources are labeled.</span>
          </div>
        </div>
        ) : (
          <BoardGallery boards={boards} onOpen={openBoard} onStream={() => switchMode("stream")} />
        )}
      </main>

      {mode === "stream" && pendingNew > 0 ? (
        <button
          type="button"
          onClick={jumpToNew}
          className="fixed bottom-[calc(5.6rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 inline-flex min-h-11 -translate-x-1/2 items-center gap-1.5 rounded-full border border-accent/30 bg-cosmos-soft/90 px-3.5 text-[10.5px] font-semibold text-accent shadow-lift backdrop-blur"
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          {pendingNew} new signal{pendingNew === 1 ? "" : "s"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setQueueOpen(true);
          setPlaying(false);
          setAutoScroll(false);
        }}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-4 text-accent-foreground shadow-lift transition hover:bg-accent/90"
      >
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        <span className="text-[11px] font-bold">Queue</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-foreground/15 px-1 text-[10px]">
          {queued.length}
        </span>
      </button>

      {/* Menu */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrandMark className="h-6 w-6" /> Aurfy
            </DialogTitle>
            <DialogDescription>Signal universe and studio</DialogDescription>
          </DialogHeader>
          <nav className="grid gap-1.5">
            {[
              { to: "/deck", label: "Concept deck" },
              { to: "/prospects", label: "Prospect engine" },
              { to: "/more", label: "Studio overview" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-card px-3 text-[12px] font-semibold text-foreground"
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Arrivals are simulated. Public snapshots, Clay simulations and fictional demos are labeled in the stream.
          </p>
        </DialogContent>
      </Dialog>

      {/* Signal detail */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
                    style={{ background: (CONCEPT_PALETTES.find((p) => p.id === selected.palette) ?? CONCEPT_PALETTES[0]).panel }}
                  >
                    <span className="text-[10px] font-bold text-primary-foreground">{selected.initials}</span>
                    {selected.logoUrl ? (
                      <img
                        src={selected.logoUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full rounded-full object-contain p-0.5"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
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

      {/* Queue */}
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
