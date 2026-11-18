import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  History,
  KanbanSquare,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { STAGES } from "@/aurfy/content";
import type { StageId } from "@/aurfy/types";
import { dueLabel, formatDate, formatDateTime, initials, merchantSourceMeta, todayISO } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { StageBadge } from "@/components/aurfy/stage-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Pill, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

export default function Pipeline() {
  const { state, merchant, pipeline, setStage, updatePipeline, setActiveMerchant, persistence } = useStudio();

  const counts = useMemo(
    () =>
      STAGES.map((stage) => ({
        ...stage,
        count: state.merchants.filter((item) => state.pipeline[item.id]?.stage === stage.id).length,
      })),
    [state.merchants, state.pipeline],
  );

  const currentSource = merchantSourceMeta(merchant);
  const overdue = state.merchants.filter((item) => dueLabel(state.pipeline[item.id]?.dueDate ?? "").tone === "overdue").length;
  const dueSoon = state.merchants.filter((item) => {
    const tone = dueLabel(state.pipeline[item.id]?.dueDate ?? "").tone;
    return tone === "today" || tone === "soon";
  }).length;
  const due = dueLabel(pipeline.dueDate);

  return (
    <div className="space-y-5">
      <PageHeader
        step={7}
        eyebrow="Prospect pipeline"
        title="Every stage is a human decision."
        description="Track the next action, not a fantasy forecast. Stage counts reflect manually entered records on this device — nothing advances on its own."
        action={<StageBadge stage={pipeline.stage} />}
      />

      <TruthNote tone="demo" title="Read the counts as demo scaffolding">
        Preseeded stages and notes are fictional. Manual records are labeled in the list. There is no delivery tracking, reply
        detection, forecast, revenue or conversion data anywhere in this prototype.
      </TruthNote>

      {/* Dashboard */}
      <section aria-labelledby="dashboard-heading">
        <SectionHeading eyebrow="Dashboard" title="Stage counts" description="All merchants in this browser workspace." />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {counts.map((stage) => (
            <div
              key={stage.id}
              className={cn(
                "surface p-3",
                stage.id === pipeline.stage && "border-primary/40 bg-primary-soft/30",
              )}
            >
              <p className="font-mono-label truncate text-[9px] text-muted-foreground">{stage.label}</p>
              <p className="mt-1.5 text-2xl font-semibold leading-none text-foreground">{stage.count}</p>
              <p className="mt-1 truncate text-[10px] text-muted-foreground">{stage.count === 1 ? "prospect" : "prospects"}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[10px] text-muted-foreground">Tracked</p>
              <p className="text-sm font-semibold text-foreground">{state.merchants.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
            <CircleAlert className={cn("h-4 w-4", overdue > 0 ? "text-destructive" : "text-muted-foreground")} aria-hidden="true" />
            <div>
              <p className="text-[10px] text-muted-foreground">Overdue</p>
              <p className="text-sm font-semibold text-foreground">{overdue}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
            <CalendarClock className="h-4 w-4 text-warning" aria-hidden="true" />
            <div>
              <p className="text-[10px] text-muted-foreground">Next 7 days</p>
              <p className="text-sm font-semibold text-foreground">{dueSoon}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Editor */}
        <div className="space-y-4">
          <section className="surface p-4 sm:p-5" aria-labelledby="stage-heading">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono-label text-[9px] text-primary">Current prospect</p>
                <h2 id="stage-heading" className="mt-1 text-lg font-semibold text-foreground">
                  {merchant.name}
                </h2>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  {merchant.category || "No category"}
                  <span aria-hidden="true">·</span>
                  {currentSource.label}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {pipeline.queuedAt ? <Pill tone="accent">Queued</Pill> : null}
                <StageBadge stage={pipeline.stage} />
              </div>
            </div>

            <fieldset className="mt-4">
              <legend className="field-label">Move the stage by hand</legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {STAGES.map((stage) => {
                  const active = pipeline.stage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setStage(stage.id);
                        toast.success(`Stage set to ${stage.label}`, {
                          description: "Manual record updated. No outreach, reminder or social action was triggered.",
                        });
                      }}
                      className={cn(
                        "min-h-11 rounded-xl border px-2.5 py-2 text-left text-[11.5px] font-semibold transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-ink-soft hover:border-primary/30 hover:bg-secondary/60",
                      )}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {STAGES.find((stage) => stage.id === pipeline.stage)?.hint}
              </p>
            </fieldset>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="pipeline-next" className="field-label">
                  Next action
                </Label>
                <Input
                  id="pipeline-next"
                  value={pipeline.nextAction}
                  onChange={(event) => updatePipeline({ nextAction: event.target.value })}
                  className="aurfy-input"
                  placeholder="e.g. Copy the outreach note and send it myself"
                  maxLength={160}
                />
                <p className="mt-1.5 text-[10.5px] text-muted-foreground">One concrete next step beats a forecast.</p>
              </div>
              <div>
                <Label htmlFor="pipeline-due" className="field-label">
                  Due date
                </Label>
                <Input
                  id="pipeline-due"
                  type="date"
                  value={pipeline.dueDate}
                  onChange={(event) => updatePipeline({ dueDate: event.target.value })}
                  className="aurfy-input"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={cn("text-[10.5px] font-medium", due.tone === "overdue" ? "text-destructive" : due.tone === "none" ? "text-muted-foreground" : "text-ink-soft")}>
                    {due.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePipeline({ dueDate: todayISO() })}
                    className="inline-flex min-h-9 items-center rounded-full border border-input bg-card px-2.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date();
                      next.setDate(next.getDate() + 7);
                      updatePipeline({ dueDate: next.toISOString().slice(0, 10) });
                    }}
                    className="inline-flex min-h-9 items-center rounded-full border border-input bg-card px-2.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    +7 days
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  No reminder is scheduled. The due date is a local note, not a notification.
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pipeline-notes" className="field-label">
                  Notes
                </Label>
                <Textarea
                  id="pipeline-notes"
                  value={pipeline.notes}
                  onChange={(event) => updatePipeline({ notes: event.target.value })}
                  className="aurfy-input min-h-[112px] text-[13px]"
                  placeholder="What happened? What did they say? What must not be assumed?"
                />
                <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  {persistence === "error"
                    ? "Local storage failed — changes may not survive a reload."
                    : "Edits save to this browser automatically. No sync, no notifications."}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="tap min-h-11">
                <Link to="/outreach">
                  Open outreach draft
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="tap min-h-11">
                <Link to="/signals">Revisit signals</Link>
              </Button>
            </div>
          </section>

          <section className="surface p-4 sm:p-5" aria-labelledby="stage-history">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 id="stage-history" className="text-[15px] font-semibold text-foreground">
                Manual stage history
              </h2>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">A local audit trail of stage changes, newest last. It does not prove any external action.</p>
            <ol className="mt-3 space-y-2">
              {pipeline.history.map((entry, index) => {
                const stage = STAGES.find((item) => item.id === entry.stage);
                return (
                  <li key={`${entry.stage}-${entry.at}-${index}`} className="flex items-start gap-2.5">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary-soft text-[8px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-border/60 pb-2">
                      <p className="text-[12px] font-semibold text-foreground">{stage?.label ?? entry.stage}</p>
                      <p className="text-[10.5px] text-muted-foreground">{formatDateTime(entry.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Prospect list */}
        <aside className="space-y-3">
          <div className="surface p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-label text-[9px] text-muted-foreground">All prospects</p>
              <Link to="/intake" className="inline-flex min-h-8 items-center gap-1 text-[11px] font-semibold text-primary">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add
              </Link>
            </div>
            <ul className="mt-2 divide-y divide-border/70">
              {state.merchants.map((item) => {
                const itemPipeline = state.pipeline[item.id];
                const itemDue = dueLabel(itemPipeline?.dueDate ?? "");
                const active = item.id === merchant.id;
                return (
                  <li key={item.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMerchant(item.id);
                        toast.success(`Switched to ${item.name}`, { description: "Stage and notes now reflect this prospect." });
                      }}
                      className="flex w-full items-start gap-2.5 rounded-lg text-left"
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                        {initials(item.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[12.5px] font-semibold text-foreground">{item.name}</span>
                          {active ? <Pill tone="primary">Open</Pill> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">{itemPipeline?.nextAction || "No next action"}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <StageBadge stage={itemPipeline?.stage ?? "research"} />
                          <Pill tone={merchantSourceMeta(item).tone}>{merchantSourceMeta(item).label}</Pill>
                          <span className={cn("text-[10px]", itemDue.tone === "overdue" ? "font-semibold text-destructive" : "text-muted-foreground")}>
                            {itemDue.label}
                          </span>
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 border-t border-border/70 pt-2 text-[10px] leading-relaxed text-muted-foreground">
              Preseeded demo records are fictional. Manual records are yours, stored in this browser only.
            </p>
          </div>

          <div className="surface p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-[12px] font-semibold text-foreground">Stage discipline</p>
            </div>
            <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
              <li>Research → Concept ready: only after the concept is reviewed.</li>
              <li>Outreach sent: only after you manually copy and send it.</li>
              <li>Responded / Meeting / Opportunity: record what actually happened; no reply detection exists.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-3 text-[10.5px] leading-relaxed text-muted-foreground">
            <p className="flex items-start gap-1.5">
              <Clock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              No scheduled follow-ups, no notifications, no CRM sync. This is a lightweight manual tracker for a hackathon demo.
            </p>
          </div>
        </aside>
      </div>

      {state.merchants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No prospects"
          description="Add a merchant to start a manual pipeline record."
          action={
            <Button asChild className="tap w-full">
              <Link to="/intake">Add merchant</Link>
            </Button>
          }
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <KanbanSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Due {formatDate(pipeline.dueDate, "not set")} · last local edit {formatDateTime(pipeline.updatedAt)}
        </p>
        <Link to="/more" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          Studio overview
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
