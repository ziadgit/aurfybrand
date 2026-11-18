import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import { SHOWCASE_EXAMPLES } from "@/aurfy/showcase";
import { CONCEPT_PALETTES } from "@/aurfy/content";
import { cn } from "@/lib/utils";
import { BrandLockup, BrandMark } from "@/components/aurfy/brand";
import { Button } from "@/components/ui/button";

const TOTAL = SHOWCASE_EXAMPLES.length;

export default function Showcase() {
  const { state, setActiveMerchant } = useStudio();
  const online = useOnline();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const example = SHOWCASE_EXAMPLES[index];
  const palette = CONCEPT_PALETTES.find((item) => item.id === example.palette) ?? CONCEPT_PALETTES[0];
  const imageFailed = Boolean(failedImages[example.image]);

  const go = (delta: number) => {
    setIndex((current) => (current + delta + TOTAL) % TOTAL);
  };

  useEffect(() => {
    document.title = "Aurfy Signal Studio — Co-brand studies";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    const next = SHOWCASE_EXAMPLES[(index + 1) % TOTAL];
    const image = new Image();
    image.src = next.image;
  }, [index]);

  const openConcept = () => {
    const exists = state.merchants.some((merchant) => merchant.id === example.merchantId);
    if (!exists) {
      toast.info("That example merchant is no longer in this workspace", {
        description: "Reset the demo data or add a merchant to build a new concept.",
      });
      navigate("/intake");
      return;
    }
    setActiveMerchant(example.merchantId);
    const examplePositioning = state.positioning[example.merchantId];
    const ready = Boolean(examplePositioning?.angle && (examplePositioning.capabilityIds?.length ?? 0) > 0);
    if (!ready) {
      toast.info("Starting from signals", {
        description: "This workspace needs a positioning angle before the concept editor opens.",
      });
    }
    navigate(ready ? "/concept" : "/signals");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setIndex(TOTAL - 1);
    }
  };

  return (
    <div className="showcase-canvas relative min-h-[100dvh] overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 top-16 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-3xl" />
        <svg
          className="absolute -left-24 bottom-[-7rem] h-[24rem] w-[24rem] opacity-[0.12]"
          viewBox="0 0 200 200"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M40 150a55 55 0 0 1 55-55" />
          <path d="M40 110a95 95 0 0 1 95 95" />
          <path d="M40 70a135 135 0 0 1 135 135" />
          <circle cx="40" cy="150" r="5" fill="hsl(var(--primary))" />
        </svg>
        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[34vw] leading-none text-foreground/[0.035] sm:text-[22vw]">
          Aurfy
        </span>
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col px-4 pb-5 pt-3 sm:px-6 sm:pt-5">
        <header className="flex shrink-0 items-center justify-between gap-2">
          <Link to="/" className="rounded-xl" aria-label="Aurfy Signal Studio home">
            <BrandLockup compact />
          </Link>
          <div className="flex items-center gap-2">
            {!online ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-warning/25 bg-warning-soft px-2.5 text-[9.5px] font-semibold text-warning">
                <WifiOff className="h-3 w-3" aria-hidden="true" />
                Saved deck
              </span>
            ) : null}
            <Link
              to="/more"
              className="tap min-h-11 border border-border/80 bg-background/70 px-4 text-[12px] text-foreground backdrop-blur hover:bg-card"
            >
              More
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-4 sm:py-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono-label text-primary">Aurfy co-brand deck</p>
              <h1 className="mt-1 font-display text-[24px] leading-[1.02] tracking-tight text-foreground sm:text-[32px]">
                Co-brand <span className="italic">studies.</span>
              </h1>
            </div>
            <p className="hidden max-w-[9.5rem] text-right text-[10px] leading-relaxed text-muted-foreground sm:block">
              Three fictional merchant studies. Illustrative ideas, no partnerships.
            </p>
          </div>

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Illustrative co-brand concept deck. Use left and right arrow keys to flip through."
            tabIndex={0}
            onKeyDown={onKeyDown}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              touchStart.current = null;
              if (!start) return;
              const touch = event.changedTouches[0];
              const dx = touch.clientX - start.x;
              const dy = touch.clientY - start.y;
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
                go(dx < 0 ? 1 : -1);
              }
            }}
            className="relative rounded-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.94] rotate-[-1.2deg] rounded-[32px] border border-border/60 bg-card/45"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-y-1.5 scale-[0.97] rotate-[0.7deg] rounded-[32px] border border-border/70 bg-card/70"
            />

            <article
              key={example.merchantId}
              role="group"
              aria-roledescription="slide"
              aria-label={`Example ${index + 1} of ${TOTAL}: ${example.name}`}
              className="animate-deck-in relative z-10 overflow-hidden rounded-[32px] border border-border/60 shadow-lift"
              style={{ background: palette.panel, color: palette.ink }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                {!imageFailed ? (
                  <img
                    src={example.image}
                    alt={example.imageAlt}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={() => setFailedImages((current) => ({ ...current, [example.image]: true }))}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: palette.panel }}>
                    <BrandMark className="h-16 w-16 opacity-40" />
                    <span className="absolute bottom-3 left-3 text-[9px] opacity-60">Example visual unavailable</span>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(9,9,18,0.32) 0%, rgba(9,9,18,0.02) 42%, rgba(9,9,18,0.44) 100%)",
                  }}
                />
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-background/90 px-3 text-[9.5px] font-semibold text-foreground backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    Illustrative concept
                  </span>
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-background/90 px-2.5 text-[9px] font-medium text-foreground backdrop-blur">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    AI-generated
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[12px] font-bold"
                      style={{ background: "hsl(45 40% 97%)", color: "hsl(234 30% 15%)" }}
                      aria-hidden="true"
                    >
                      {example.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold leading-tight sm:text-[17px]">{example.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10.5px]" style={{ opacity: 0.68 }}>
                        <span aria-hidden="true">×</span>
                        <BrandMark className="h-4 w-4" />
                        <span className="font-medium">Aurfy</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-medium"
                    style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }}
                  >
                    {example.angleLabel}
                  </span>
                </div>

                <h2 className="mt-3.5 max-w-[16ch] font-display text-[26px] leading-[1.03] tracking-tight sm:text-[32px]">
                  {example.headline}
                </h2>
                <p className="mt-1.5 max-w-[34ch] text-[11.5px] leading-snug sm:text-[12px] sm:leading-relaxed" style={{ opacity: 0.82 }}>
                  {example.subhead}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[9.5px] font-medium"
                    style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)" }}
                  >
                    <Check className="h-3 w-3" style={{ color: palette.accent }} aria-hidden="true" />
                    {example.capability}
                  </span>
                  <span
                    className="hidden min-h-8 items-center rounded-full border px-2.5 text-[9px] font-medium sm:inline-flex"
                    style={{ borderColor: "rgba(255,255,255,0.14)", opacity: 0.8 }}
                  >
                    {example.category}
                  </span>
                </div>

                <div className="mt-3.5 border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                  <div className="flex items-end justify-between gap-3">
                    <p className="max-w-[58%] text-[10px] leading-snug" style={{ opacity: 0.75 }}>
                      Illustrative concept for discussion. No partnership implied.
                    </p>
                    <span className="flex shrink-0 items-center gap-1.5" aria-label="Aurfy concept study">
                      <BrandMark className="h-5 w-5" />
                      <span className="font-display text-[21px] italic leading-none" style={{ color: palette.accent }}>
                        Aurfy
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <div className="absolute inset-x-0 top-[19%] z-20 flex -translate-y-1/2 items-center justify-between px-2.5">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous concept"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-card backdrop-blur transition hover:bg-card active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next concept"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-card backdrop-blur transition hover:bg-card active:scale-95"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1" role="group" aria-label="Choose a concept example">
              {SHOWCASE_EXAMPLES.map((item, dotIndex) => {
                const active = dotIndex === index;
                return (
                  <button
                    key={item.merchantId}
                    type="button"
                    onClick={() => setIndex(dotIndex)}
                    aria-label={`Show ${item.name} concept`}
                    aria-current={active ? "true" : undefined}
                    className="flex h-11 w-8 items-center justify-center rounded-full"
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-all",
                        active ? "w-7 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/50",
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <p className="font-mono-label text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
            </p>
          </div>

          <Button
            type="button"
            onClick={openConcept}
            className="mt-1 h-11 w-full rounded-full bg-primary text-[12.5px] font-semibold text-primary-foreground shadow-card hover:bg-primary/90"
          >
            Open this concept
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="mt-1 flex items-center justify-center">
            <Link to="/intake" className="inline-flex min-h-8 items-center text-[10.5px] font-semibold text-primary">
              Start with a new merchant
            </Link>
          </div>

          <p className="sr-only" aria-live="polite">
            Example {index + 1} of {TOTAL}: {example.name}. {example.headline}
          </p>
        </main>

        <footer className="mt-2 shrink-0 border-t border-border/70 pt-2.5">
          <p className="flex items-start gap-1.5 text-[10px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            Fictional merchants and AI-generated visuals. No partnership implied. Nothing is sent or published.
          </p>
          <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground">
            Aurfy · online and in-store payments · cards and digital wallets · one unified API
          </p>
        </footer>
      </div>
    </div>
  );
}
