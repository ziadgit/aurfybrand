import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  CloudOff,
  Compass,
  Download,
  Layers,
  MessageSquareQuote,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import { nextIncompleteStep, workflowProgress } from "@/aurfy/progress";
import { STAGES } from "@/aurfy/content";
import { dueLabel, formatDate, hostOf, initials } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { WORKFLOW } from "@/components/aurfy/nav";
import { MerchantSwitcher } from "@/components/aurfy/merchant-switcher";
import { Pill, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";
import { StageBadge } from "@/components/aurfy/stage-badge";

export default function Studio() {
  const {
    merchant,
    signals,
    selectedSignals,
    brief,
    positioning,
    concept,
    outreach,
    pipeline,
    state,
    persistence,
  } = useStudio();
  const online = useOnline();

  const done = workflowProgress({ selectedSignals, brief, positioning, concept, outreach, pipeline });
  const completed = Object.values(done).filter(Boolean).length;
  const next = nextIncompleteStep(done);
  const nextMeta = WORKFLOW[next.step - 1];
  const stage = STAGES.find((item) => item.id === pipeline.stage);
  const due = dueLabel(pipeline.dueDate);
  const stageCounts = STAGES.map((item) => ({
    ...item,
    count: state.merchants.filter((merchantItem) => state.pipeline[merchantItem.id]?.stage === item.id).length,
  }));
  const customerSelected = selectedSignals.filter((signal) => signal.category === "customer").length;
  const peerSelected = selectedSignals.filter((signal) => signal.category === "peer").length;
  const balanced = customerSelected > 0 && peerSelected > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-semibold text-ink-soft transition hover:border-primary/30 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Concept deck
        </Link>
        <span className="font-mono-label text-[9px] text-muted-foreground">More · how it works</span>
      </div>

      {/* Hero */}
      <section className="aurfy-ink-card aurfy-grain relative overflow-hidden rounded-[26px] px-5 pb-6 pt-5 shadow-lift sm:px-8 sm:pb-8 sm:pt-7">
        <svg
          className="pointer-events-none absolute -right-10 -top-16 h-[280px] w-[280px] opacity-[0.16] sm:-right-6 sm:h-[360px] sm:w-[360px]"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <g fill="none" stroke="hsl(73 84% 62%)" strokeWidth="6" strokeLinecap="round">
            <path d="M40 150a55 55 0 0 1 55-55" />
            <path d="M40 110a95 95 0 0 1 95 95" />
            <path d="M40 70a135 135 0 0 1 135 135" />
          </g>
          <circle cx="40" cy="150" r="8" fill="hsl(73 84% 62%)" />
        </svg>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="aurfy-chip border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Converge.AI hackathon prototype
            </span>
            <span className="aurfy-chip border-primary-foreground/15 bg-transparent text-primary-foreground/75">
              {online ? "No live signals connected" : "Offline"}
            </span>
          </div>

          <h1 className="mt-4 max-w-lg font-display text-[36px] leading-[0.98] tracking-[-0.01em] sm:text-[52px]">
            Turn a signal into a <span className="italic text-accent">conversation.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-primary-foreground/80 sm:text-[15px]">
            Seven bounded steps for a lean GTM team: observe customer and peer behaviour, separate evidence from inference, and
            leave with a reviewed note and one manual next action.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              to={next.path}
              className="tap bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {next.step === 2 && completed <= 1 ? "Start with signals" : `Continue: ${nextMeta.short}`}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/pipeline"
              className="tap border border-primary-foreground/25 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Target className="h-4 w-4" aria-hidden="true" />
              Next sales action
            </Link>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-primary-foreground/15 pt-4 text-primary-foreground">
            <div>
              <dt className="font-mono-label text-[9px] text-primary-foreground/60">Selected</dt>
              <dd className="mt-1 text-lg font-semibold">
                {selectedSignals.length}
                <span className="ml-1 text-[11px] font-normal text-primary-foreground/60">signals</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono-label text-[9px] text-primary-foreground/60">Reviewed</dt>
              <dd className="mt-1 text-lg font-semibold">
                {completed}
                <span className="ml-1 text-[11px] font-normal text-primary-foreground/60">/ 7 steps</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono-label text-[9px] text-primary-foreground/60">Stage</dt>
              <dd className="mt-1 truncate text-[13px] font-semibold">{stage?.label ?? "Research"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Working on */}
      <section className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono-label text-[10px] text-muted-foreground">Working merchant</p>
          <div className="flex items-center gap-1.5">
            <Pill tone={merchant.isDemo ? "warning" : "outline"}>{merchant.isDemo ? "Demo · fictional" : "Manual record"}</Pill>
            <StageBadge stage={pipeline.stage} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
            {initials(merchant.name) || <Users className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-tight text-foreground">{merchant.name}</h2>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {merchant.category || "No category yet"} · {hostOf(merchant.url) || "No URL"}
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <MerchantSwitcher compact />
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3">
            <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-ink-soft">
              <span className="font-semibold">Next action: </span>
              {pipeline.nextAction || "No next action recorded yet."}
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {due.label}
                {pipeline.dueDate ? ` · ${formatDate(pipeline.dueDate)}` : ""}
              </span>
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3">
            <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-ink-soft">
              <span className="font-semibold">Saved locally. </span>
              {persistence === "error"
                ? "Browser storage failed — latest edits may not persist."
                : persistence === "saving"
                  ? "Writing this device's browser storage…"
                  : "No account, no sync. Only this browser keeps the work."}
            </p>
          </div>
        </div>
      </section>

      {/* Signal balance + pipeline */}
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="surface p-4 sm:p-5 lg:col-span-3">
          <SectionHeading
            eyebrow="Signal mix"
            title="Keep both lenses in view"
            description="Customer behaviour and peer/competitor signals carry different confidence and different questions."
            action={
              <Link to="/signals" className="tap border border-input bg-card px-3 text-xs text-foreground hover:bg-secondary">
                <Radar className="h-4 w-4" aria-hidden="true" />
                Open feed
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Customer behaviour</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {customerSelected} / {signals.filter((signal) => signal.category === "customer").length}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${customerSelected} customer signals selected`}>
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (customerSelected / Math.max(1, signals.filter((signal) => signal.category === "customer").length)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Peer & competitor</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {peerSelected} / {signals.filter((signal) => signal.category === "peer").length}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${peerSelected} peer signals selected`}>
                <div
                  className="h-full rounded-full bg-accent-foreground/80 transition-all"
                  style={{ width: `${Math.min(100, (peerSelected / Math.max(1, signals.filter((signal) => signal.category === "peer").length)) * 100)}%` }}
                />
              </div>
            </div>
            <p className={cn("text-[11px] leading-relaxed", balanced ? "text-success" : "text-warning")}>
              {balanced
                ? `Balanced enough to reason with: ${customerSelected} customer and ${peerSelected} peer signal${peerSelected === 1 ? "" : "s"} selected.`
                : "Aim for at least one customer and one peer signal before drafting a brief. The studio will keep prompting, not block you."}
            </p>
          </div>
        </section>

        <section className="surface p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono-label text-[9px] text-muted-foreground">Team pipeline</p>
              <p className="mt-1 text-[15px] font-semibold text-foreground">{state.merchants.length} prospects tracked</p>
            </div>
            <Link to="/pipeline" className="tap min-h-9 border border-input bg-card px-3 text-xs hover:bg-secondary">
              Open
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-1.5">
            {stageCounts.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-muted/35 px-2 py-2">
                <span className="block text-lg font-semibold leading-none text-foreground">{item.count}</span>
                <span className="mt-1 block truncate text-[10px] text-muted-foreground">{item.short}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Stage is recorded by hand. Nothing moves a prospect automatically and no message is sent by the app.
          </p>
        </section>
      </div>

      {/* Workflow */}
      <section>
        <SectionHeading
          eyebrow="The workflow"
          title="Seven steps, human in the loop"
          description="Every step can be revisited. A check appears only when the review condition is genuinely met."
        />
        <ol className="mt-4 space-y-2">
          {WORKFLOW.map((item) => {
            const stepNumber = item.step ?? 1;
            const isDone = done[stepNumber];
            const isNext = next.step === stepNumber;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "surface flex min-h-[68px] items-center gap-3 p-3.5 transition hover:border-primary/35 hover:shadow-lift sm:p-4",
                    isNext && "border-primary/40 ring-1 ring-primary/15",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      isDone
                        ? "border-success/25 bg-success-soft text-success"
                        : isNext
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" aria-label="Complete" /> : String(stepNumber).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
                      <span className="truncate text-sm font-semibold text-foreground">
                        {item.short === "Angle" ? "Positioning" : item.label}
                      </span>
                      {isNext ? <Pill tone="primary" className="ml-1 hidden sm:inline-flex">Next</Pill> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.description}</span>
                  </span>
                  <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
                    {isDone ? "Reviewed" : isNext ? "Pick up here" : "Open"}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Boundaries */}
      <section className="grid gap-3 sm:grid-cols-2">
        <TruthNote tone="demo" title="Fictional by default">
          The preseeded merchants, signals, peer claims and pipeline stages are fabricated to demonstrate the workflow. There is no
          live web research, social feed access or external API key in this prototype.
        </TruthNote>
        <TruthNote tone="safety" title="Bounded, not autonomous" icon={ShieldCheck}>
          No auto-sending, no social posting, no campaign actions. Outreach is copied by hand and the co-branded concept is marked
          “Illustrative concept for discussion. No partnership implied.”
        </TruthNote>
        <TruthNote tone="info" title="AI is optional and labeled" icon={Sparkles}>
          Brief and outreach drafting can use connected server-side AI, and the concept can generate optional artwork. AI text falls
          back to a labeled template; generated visuals are always labeled illustrative. Nothing pretends AI wrote a template.
        </TruthNote>
        <TruthNote tone="info" title="Offline & install" icon={CloudOff}>
          The production build ships a manifest, icons and a service worker for the app shell. Offline only restores saved work and
          cached files — it never simulates fresh signal retrieval.
        </TruthNote>
      </section>

      <div className="flex flex-wrap items-center gap-2 pb-2">
        <Link to="/intake" className="tap border border-input bg-card px-4 text-xs text-foreground hover:bg-secondary">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Merchant intake & records
        </Link>
        <Link to="/signals" className="tap border border-input bg-card px-4 text-xs text-foreground hover:bg-secondary">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse demo signals
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Download className="h-3 w-3" aria-hidden="true" />
          Install from the menu when supported
        </span>
      </div>
    </div>
  );
}
