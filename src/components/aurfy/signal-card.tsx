import { Bookmark, Check, ChevronDown, ExternalLink, Link2, MessageSquareQuote, ThumbsDown, TriangleAlert } from "lucide-react";
import type { Signal, SignalStatus } from "@/aurfy/types";
import { CATEGORY_LABEL, PROVENANCE_LABEL, formatDate } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { Pill } from "./ui-bits";

const confidenceTone = { low: "warning", medium: "primary", high: "success" } as const;
const statusTone = { new: "neutral", selected: "success", saved: "primary", rejected: "danger" } as const;
const statusLabel = { new: "Not actioned", selected: "Selected", saved: "Saved for later", rejected: "Rejected" } as const;

export function SignalCard({
  signal,
  onStatusChange,
  position = 1,
}: {
  signal: Signal;
  onStatusChange: (status: SignalStatus) => void;
  position?: number;
}) {
  const isSelected = signal.status === "selected";
  const isSaved = signal.status === "saved";
  const isRejected = signal.status === "rejected";

  return (
    <article
      className={cn(
        "surface relative overflow-hidden p-4 transition sm:p-5",
        isSelected && "border-primary/40 ring-1 ring-primary/20",
        isRejected && "opacity-70",
      )}
      aria-labelledby={`signal-${signal.id}-title`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone={signal.category === "customer" ? "primary" : "neutral"}>
          {CATEGORY_LABEL[signal.category]}
        </Pill>
        <Pill tone={confidenceTone[signal.confidence]}>{signal.confidence} confidence</Pill>
        {signal.provenance === "demo" ? (
          <Pill tone="warning" icon={TriangleAlert}>
            Demo · fictional
          </Pill>
        ) : signal.provenance === "public" ? (
          <Pill tone="primary">Public snapshot</Pill>
        ) : signal.provenance === "news" ? (
          <Pill tone="accent">Live news</Pill>
        ) : signal.provenance === "clay" ? (
          <Pill tone="warning">Clay simulation</Pill>
        ) : (
          <Pill tone="outline">User-supplied</Pill>
        )}
        <span className="ml-auto font-mono-label text-[10px] text-muted-foreground">#{String(position).padStart(2, "0")}</span>
      </div>

      <h3 id={`signal-${signal.id}-title`} className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-foreground">
        {signal.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1">
          <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium text-ink-soft">{signal.sourceName}</span>
        </span>
        {signal.sourceUrl ? (
          signal.provenance === "user" || signal.provenance === "public" || signal.provenance === "news" ? (
            <a
              href={signal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex min-h-6 min-w-0 items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
              title={
                signal.provenance === "public"
                  ? "Opens the public page read for this snapshot. Not independently audited."
                  : signal.provenance === "news"
                    ? "Opens the news article link from the live RSS result. The article was not fetched."
                    : "Opens the user-supplied URL. Not verified by Aurfy."
              }
            >
              <span className="max-w-[15rem] truncate">{signal.sourceUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1" title="Fictional demo URL — not a real page">
              <span className="max-w-[15rem] truncate">{signal.sourceUrl.replace(/^https?:\/\//, "")}</span>
            </span>
          )
        ) : (
          <span className="text-muted-foreground">No URL — simulated</span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl bg-muted/50 px-3 py-2.5 text-[11px]">
        <div>
          <dt className="font-mono-label text-[9px] text-muted-foreground">Published</dt>
          <dd className="mt-0.5 font-medium text-ink-soft">
            {signal.sourceDate
              ? formatDate(signal.sourceDate)
              : signal.provenance === "demo"
                ? "Not supplied (fictional demo)"
                : signal.provenance === "clay"
                  ? "No date (simulated)"
                  : signal.provenance === "public"
                    ? "Not stated on page"
                    : signal.provenance === "news"
                      ? "Not supplied by feed"
                      : "Not supplied by you"}
          </dd>
        </div>
        <div>
          <dt className="font-mono-label text-[9px] text-muted-foreground">Retrieved</dt>
          <dd className="mt-0.5 font-medium text-ink-soft">
            {signal.retrievedAt
              ? formatDate(signal.retrievedAt)
              : signal.provenance === "clay"
                ? "Not retrieved (simulated)"
                : "Not retrieved by this app"}
          </dd>
        </div>
      </dl>

      <div className="mt-3 rounded-xl border-l-2 border-primary/40 bg-secondary/50 px-3 py-2.5">
        <p className="font-mono-label text-[9px] text-primary">Observed evidence</p>
        <p className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">{signal.evidence}</p>
      </div>

      <div className="mt-2.5 rounded-xl border border-dashed border-warning/35 bg-warning-soft/40 px-3 py-2.5">
        <p className="font-mono-label flex items-center gap-1.5 text-[9px] text-warning">
          <TriangleAlert className="h-3 w-3" aria-hidden="true" />
          Why it might matter · inference
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{signal.whyItMatters}</p>
      </div>

      {signal.provenance === "clay" ? (
        <p className="mt-2 rounded-lg border border-warning/25 bg-warning-soft/50 px-2.5 py-1.5 text-[10px] leading-relaxed text-warning">
          Simulated Clay record. Not real enrichment, a real merchant or a real source.
        </p>
      ) : null}
      {signal.provenance === "news" ? (
        <p className="mt-2 rounded-lg border border-accent/40 bg-accent-soft/60 px-2.5 py-1.5 text-[10px] leading-relaxed text-accent-foreground">
          Live RSS headline, published {signal.sourceDate ? formatDate(signal.sourceDate) : "date not supplied"}. The article body was not
          fetched or independently verified.
        </p>
      ) : null}
      {signal.provenance === "public" ? (
        <p className="mt-2 rounded-lg border border-primary/15 bg-primary-soft/50 px-2.5 py-1.5 text-[10px] leading-relaxed text-secondary-foreground">
          Public page snapshot read on {formatDate(signal.retrievedAt)}. Not independently audited; no payment data is implied.
        </p>
      ) : null}

      <p className="mt-2.5 flex gap-2 text-[13px] leading-relaxed text-foreground">
        <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          <span className="font-semibold">Ask: </span>
          {signal.question}
        </span>
      </p>

      <details className="group mt-3 rounded-xl border border-border/80 bg-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 text-xs font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
          Novelty rationale, limitations & confidence
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-2.5 border-t border-border/70 px-3 py-3 text-[12px] leading-relaxed">
          <div>
            <p className="font-mono-label text-[9px] text-muted-foreground">Novelty rationale</p>
            <p className="mt-1 text-ink-soft">{signal.novelty}</p>
          </div>
          <div>
            <p className="font-mono-label text-[9px] text-muted-foreground">Limitations</p>
            <p className="mt-1 text-ink-soft">{signal.limitations}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill tone={confidenceTone[signal.confidence]}>{signal.confidence} confidence</Pill>
            <Pill
              tone={
                signal.provenance === "public"
                  ? "primary"
                  : signal.provenance === "news"
                    ? "accent"
                    : signal.provenance === "clay"
                      ? "warning"
                      : "outline"
              }
            >
              {PROVENANCE_LABEL[signal.provenance]}
            </Pill>
            <Pill tone={statusTone[signal.status]}>{statusLabel[signal.status]}</Pill>
          </div>
        </div>
      </details>

      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={`Signal actions for ${signal.title}`}>
        <button
          type="button"
          aria-pressed={isSelected}
          onClick={() => onStatusChange(isSelected ? "new" : "selected")}
          className={cn(
            "tap px-2 text-xs",
            isSelected
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-primary/30 bg-card text-primary hover:bg-primary-soft",
          )}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {isSelected ? "Selected" : "Select"}
        </button>
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() => onStatusChange(isSaved ? "new" : "saved")}
          className={cn(
            "tap px-2 text-xs",
            isSaved
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "border border-input bg-card text-foreground hover:bg-secondary",
          )}
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          {isSaved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          aria-pressed={isRejected}
          onClick={() => onStatusChange(isRejected ? "new" : "rejected")}
          className={cn(
            "tap px-2 text-xs",
            isRejected
              ? "border border-destructive/30 bg-destructive/10 text-destructive"
              : "border border-transparent bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
          {isRejected ? "Rejected" : "Reject"}
        </button>
      </div>
    </article>
  );
}
