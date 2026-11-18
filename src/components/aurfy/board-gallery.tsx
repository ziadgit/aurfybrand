import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Capability, ConceptDraft, Merchant, PipelineEntry, Signal } from "@/aurfy/types";
import { STAGES } from "@/aurfy/content";
import { initials, merchantSourceMeta, PROVENANCE_LABEL } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { ConceptCard } from "./concept-card";
import { Pill } from "./ui-bits";
import { Button } from "@/components/ui/button";

export type BoardData = {
  merchant: Merchant;
  concept?: ConceptDraft;
  pipeline?: PipelineEntry;
  signal?: Signal;
  capability?: Capability;
  angle?: { label: string };
  hasConcept: boolean;
  queued: boolean;
};

export function BoardGallery({
  boards,
  onOpen,
  onStream,
}: {
  boards: BoardData[];
  onOpen: (merchantId: string, hasConcept: boolean) => void;
  onStream: () => void;
}) {
  const [index, setIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const total = boards.length;
  const activeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const board = boards[activeIndex];
  const stage = board ? STAGES.find((item) => item.id === (board.pipeline?.stage ?? "research")) : undefined;
  const meta = board ? merchantSourceMeta(board.merchant) : undefined;
  const go = (delta: number) => setIndex((current) => current + delta);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-40 pt-3 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono-label text-[8.5px] text-accent">co-brand boards</p>
          <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-primary-foreground/45">
            The concepts already in orbit, plus queued starts. Flip the stack, then open a board.
          </p>
        </div>
        <span className="shrink-0 font-mono-label text-[9px] text-primary-foreground/35">
          {total > 0 ? `${String(activeIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}` : "00 / 00"}
        </span>
      </div>

      {total === 0 || !board ? (
        <div className="mt-5 flex flex-col items-center rounded-[28px] border border-primary-foreground/10 bg-cosmos-soft/40 px-5 py-16 text-center">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl text-primary-foreground">No boards in orbit yet.</p>
          <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-primary-foreground/45">
            Queue a signal from the stream, or pull a live company page, to start a co-brand.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" className="min-h-10" onClick={onStream}>
              Back to the stream
            </Button>
            <Button asChild variant="outline" className="min-h-10">
              <Link to="/prospects">Pull a live company</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill tone={meta?.tone ?? "outline"}>{meta?.label ?? "Board"}</Pill>
              <span className="text-[8.5px] uppercase tracking-[0.14em] text-primary-foreground/35">
                {stage?.label ?? "Research"}
              </span>
              {board.queued ? <Pill tone="accent">Queued</Pill> : null}
            </div>
            <span className="text-[9px] text-primary-foreground/35">
              {board.hasConcept ? (board.concept?.reviewed ? "Reviewed" : "Draft") : "Start"}
            </span>
          </div>

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Co-brand boards. Use left and right arrow keys to flip."
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                go(1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                go(-1);
              }
            }}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              if ((event.target as HTMLElement).closest("button, a")) return;
              pointerStart.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              const start = pointerStart.current;
              pointerStart.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
            }}
            onPointerCancel={() => {
              pointerStart.current = null;
            }}
            style={{ touchAction: "pan-y" }}
            className="relative mt-1 cursor-grab rounded-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4 focus-visible:ring-offset-cosmos active:cursor-grabbing"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.94] rotate-[-1.4deg] rounded-[30px] border border-primary-foreground/10 bg-cosmos-soft/60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-y-1.5 scale-[0.97] rotate-[0.7deg] rounded-[30px] border border-primary-foreground/10 bg-cosmos-soft/70"
            />

            <div key={board.merchant.id} className="animate-deck-in relative z-10">
              {board.hasConcept && board.concept ? (
                <ConceptCard
                  merchantName={board.concept.merchantDisplayName || board.merchant.name}
                  initials={initials(board.merchant.name)}
                  category={board.merchant.category}
                  angleLabel={board.angle?.label}
                  headline={board.concept.headline}
                  subhead={board.concept.subhead}
                  capability={board.capability?.label}
                  signalNote={board.signal ? `${PROVENANCE_LABEL[board.signal.provenance]}: ${board.signal.title}` : undefined}
                  palette={board.concept.palette}
                  layout={board.concept.layout ?? "editorial"}
                  fontId={board.concept.displayFont ?? "bodoni"}
                  imageUrl={board.concept.imageUrl}
                  imageAlt={`Illustrative co-brand concept for ${board.merchant.name}; no partnership implied.`}
                  logoUrl={board.concept.logoDataUrl}
                  redacted={Boolean(board.concept.sendSafe)}
                  className="shadow-lift"
                />
              ) : (
                <div className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-primary-foreground/15 bg-cosmos-soft/70 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl ring-1 ring-primary-foreground/15"
                      style={{ background: "hsl(45 40% 97%)" }}
                    >
                      <span className="text-[11px] font-bold" style={{ color: "hsl(234 30% 15%)" }}>
                        {initials(board.merchant.name)}
                      </span>
                      {board.concept?.logoDataUrl ? (
                        <img
                          src={board.concept.logoDataUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain p-1"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-primary-foreground">{board.merchant.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-primary-foreground/40">{board.merchant.category}</p>
                    </div>
                  </div>
                  <p className="mt-8 font-mono-label text-[8px] text-accent">queued co-brand</p>
                  <p className="mt-2 max-w-[24ch] font-display text-[28px] leading-[1.08] text-primary-foreground">
                    A board is queued, but the concept has not been drawn yet.
                  </p>
                  <div className="mt-4 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-3">
                    <p className="font-mono-label text-[8px] text-primary-foreground/35">queued from</p>
                    <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-primary-foreground/70">
                      {board.pipeline?.queuedSignal || "No signal recorded."}
                    </p>
                  </div>
                  <p className="mt-3 text-[10.5px] leading-relaxed text-primary-foreground/40">
                    Open it to select signals, build the brief and choose an angle; the board fills in from there.
                  </p>
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 top-[30%] z-20 flex -translate-y-1/2 items-center justify-between px-2.5">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous co-brand board"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/15 bg-cosmos-soft/85 text-primary-foreground shadow-lift backdrop-blur transition hover:bg-cosmos-soft"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next co-brand board"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/15 bg-cosmos-soft/85 text-primary-foreground shadow-lift backdrop-blur transition hover:bg-cosmos-soft"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-1.5 text-center text-[9px] uppercase tracking-[0.14em] text-primary-foreground/25 sm:hidden">
            swipe or use the arrows
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1" role="group" aria-label="Choose a co-brand board">
              {boards.map((item, dotIndex) => (
                <button
                  key={item.merchant.id}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`Show ${item.merchant.name} board`}
                  aria-current={dotIndex === activeIndex ? "true" : undefined}
                  className="flex h-10 w-7 items-center justify-center rounded-full"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all",
                      dotIndex === activeIndex ? "w-6 bg-accent" : "w-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="truncate text-right text-[9.5px] text-primary-foreground/35">{board.merchant.name}</p>
          </div>

          <Button
            type="button"
            className="mt-2 min-h-12 w-full rounded-full"
            onClick={() => onOpen(board.merchant.id, board.hasConcept)}
          >
            {board.hasConcept ? "Open this board" : "Start this board"}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
            <button
              type="button"
              onClick={onStream}
              className="inline-flex min-h-8 items-center text-primary-foreground/40 hover:text-primary-foreground/70"
            >
              Back to the signal stream
            </button>
            <Link to="/prospects" className="inline-flex min-h-8 items-center text-accent">
              Pull a live company
            </Link>
          </div>

          <div className="mt-7 border-t border-primary-foreground/10 pt-4 text-center text-[8.5px] leading-relaxed text-primary-foreground/30">
            Illustrative concepts · fictional or public demo data · no partnership implied.
            <br />
            Public-site logos are used for illustrative discussion only; send-safe boards hide logos and imagery.
          </div>
        </>
      )}
    </div>
  );
}
