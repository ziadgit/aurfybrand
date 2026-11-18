import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, FileSearch, Info, Layers, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import { AI_AVAILABLE, AI_MODEL_LABEL, requestAiBrief } from "@/aurfy/ai";
import { templateBrief } from "@/aurfy/draft";
import { CATEGORY_LABEL, PROVENANCE_LABEL, formatDateTime } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, EmptyState, Pill, ReviewToggle, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

function GenerationBadge({ generation }: { generation: "template" | "ai" | "manual" }) {
  if (generation === "ai") return <Pill tone="primary" icon={Sparkles}>AI-assisted draft</Pill>;
  if (generation === "template") return <Pill tone="neutral">Template draft</Pill>;
  return <Pill tone="outline">Edited by hand</Pill>;
}

export default function Brief() {
  const { merchant, signals, selectedSignals, brief, positioning, updateBrief } = useStudio();
  const online = useOnline();
  const customerSelected = selectedSignals.filter((signal) => signal.category === "customer").length;
  const peerSelected = selectedSignals.filter((signal) => signal.category === "peer").length;
  const [generating, setGenerating] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const hasContent = Boolean(brief.observed.trim() || brief.hypotheses.trim() || brief.unknowns.trim());

  const briefText = useMemo(
    () =>
      [
        `Merchant brief — ${merchant.name}`,
        `Assembled ${formatDateTime(brief.updatedAt)} · ${brief.generation === "ai" ? "AI-assisted" : brief.generation === "template" ? "Template" : "Manual"}`,
        "",
        "OBSERVED EVIDENCE",
        brief.observed || "— none recorded —",
        "",
        "HYPOTHESES (inference, not fact)",
        brief.hypotheses || "— none recorded —",
        "",
        "UNKNOWNS",
        brief.unknowns || "— none recorded —",
        "",
        "Prototype note: demo and user-supplied signals are not independently verified. This brief is a working document, not a research report.",
      ].join("\n"),
    [brief, merchant.name],
  );

  const assembleWithAi = async () => {
    setAiBusy(true);
    const result = await requestAiBrief({
      merchant,
      signals: selectedSignals,
      angle: positioning.angle,
      capabilityIds: positioning.capabilityIds,
      capabilities: positioning.capabilities,
    });
    if (result.ok) {
      updateBrief({
        observed: result.draft.observed,
        hypotheses: result.draft.hypotheses,
        unknowns: result.draft.unknowns,
        generation: "ai",
        generatedFrom: selectedSignals.map((signal) => signal.id),
        reviewed: false,
      });
      toast.success("AI-assisted brief ready", {
        description: `${AI_MODEL_LABEL} via server-side AI. Review every line; AI can still be wrong.`,
      });
    } else {
      const fallback = templateBrief(merchant, selectedSignals);
      updateBrief({
        observed: fallback.observed,
        hypotheses: fallback.hypotheses,
        unknowns: fallback.unknowns,
        generation: "template",
        generatedFrom: selectedSignals.map((signal) => signal.id),
        reviewed: false,
      });
      toast.warning("AI unavailable — deterministic template used", {
        description: result.reason,
      });
    }
    setAiBusy(false);
  };

  const assemble = () => {
    setGenerating(true);
    const result = templateBrief(merchant, selectedSignals);
    updateBrief({
      observed: result.observed,
      hypotheses: result.hypotheses,
      unknowns: result.unknowns,
      generation: "template",
      generatedFrom: selectedSignals.map((signal) => signal.id),
      reviewed: false,
    });
    setGenerating(false);
    toast.success("Brief assembled from selected signals", {
      description: "Deterministic template. Review the wording and mark it reviewed.",
    });
  };

  if (selectedSignals.length === 0 && !hasContent) {
    return (
      <div className="space-y-5">
        <PageHeader step={3} eyebrow="Merchant brief" title="Separate what you saw from what you think." />
        <EmptyState
          icon={FileSearch}
          title="No signals selected yet"
          description="A brief needs evidence. Go back to the feed and select the customer and peer signals you want to reason with."
          action={
            <Button asChild className="tap w-full">
              <Link to="/signals">
                Choose signals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        step={3}
        eyebrow="Merchant brief"
        title="Separate what you saw from what you think."
        description="Three editable fields keep the working document honest: observed evidence, explicit hypotheses, and the unknowns that would change the conversation."
        action={<GenerationBadge generation={brief.generation} />}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-3.5">
          <p className="font-mono-label text-[9px] text-muted-foreground">Selected evidence</p>
          <p className="mt-1 text-base font-semibold text-foreground">{selectedSignals.length} signals</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {customerSelected} customer · {peerSelected} peer
          </p>
        </div>
        <div className="surface p-3.5">
          <p className="font-mono-label text-[9px] text-muted-foreground">Last assembled / edited</p>
          <p className="mt-1 text-[13px] font-semibold text-foreground">{formatDateTime(brief.updatedAt)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Local time · this browser</p>
        </div>
        <div className="surface p-3.5">
          <p className="font-mono-label text-[9px] text-muted-foreground">Review state</p>
          <p className={cn("mt-1 text-base font-semibold", brief.reviewed ? "text-success" : "text-warning")}>
            {brief.reviewed ? "Reviewed" : "Needs review"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">A human sign-off, not a model score.</p>
        </div>
      </div>

      {customerSelected === 0 || peerSelected === 0 ? (
        <TruthNote tone="demo" title="One lens is missing">
          You have {customerSelected} customer and {peerSelected} peer signals selected. The workflow will still proceed, but the brief
          is likely to read one-sided. The app flags this rather than inventing balance.
        </TruthNote>
      ) : null}

      <section className="surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeading
            eyebrow="Assembly"
            title="Build from the selected cards"
            description="The template quotes your signal text and keeps inference labels intact. It does not add research or fill gaps."
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {hasContent ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="tap min-h-11">
                  <Layers className="h-4 w-4" />
                  Re-assemble from {selectedSignals.length} signals
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Replace the three brief fields?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The current observed evidence, hypotheses, unknowns and any manual edits will be overwritten by a fresh template.
                    Your signal selections are not changed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my edits</AlertDialogCancel>
                  <AlertDialogAction onClick={assemble}>Replace with template</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button className="tap min-h-11" onClick={assemble} disabled={generating || selectedSignals.length === 0}>
              <Layers className="h-4 w-4" />
              {generating ? "Assembling…" : "Assemble from selected signals"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="tap min-h-11"
            onClick={assembleWithAi}
            disabled={aiBusy || selectedSignals.length === 0 || !online}
            title={
              !online
                ? "AI drafting needs a connection"
                : AI_AVAILABLE
                  ? "Server-side AI, only the selected cards are sent"
                  : "AI is not connected"
            }
          >
            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiBusy ? "Drafting with AI…" : "Draft with AI"}
          </Button>
          <CopyButton text={briefText} label="Copy brief" variant="outline" />
          <Button
            asChild
            variant="outline"
            className="tap min-h-11"
          >
            <Link to="/signals">
              Change signals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <GenerationBadge generation={brief.generation} />
          <span className="divider-dot">
            {brief.generation === "template"
              ? "Deterministic output. No AI model was involved."
              : brief.generation === "ai"
                ? "Server-side AI output, reviewed by you before use."
                : "Edited directly. No generation event recorded."}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {AI_AVAILABLE
            ? `AI-assisted drafting is connected server-side (${AI_MODEL_LABEL}). Only the selected cards and approved capability wording are sent. If it fails or you are offline, the deterministic template is applied and the badge above reads “Template draft”.`
            : "AI drafting is not connected in this build. The deterministic template is complete on its own."}
        </p>
      </section>

      <section className="surface p-4 sm:p-6" aria-labelledby="brief-fields">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="brief-fields" className="text-base font-semibold text-foreground">
            Working brief
          </h2>
        </div>

        <div className="mt-4 space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="brief-observed" className="field-label mb-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                Observed evidence
              </Label>
              <span className="text-[10px] text-muted-foreground">{brief.observed.length} chars</span>
            </div>
            <p className="mb-2 mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Quote or paraphrase only what the source says. Keep demo and user-supplied labels.
            </p>
            <Textarea
              id="brief-observed"
              value={brief.observed}
              onChange={(event) => updateBrief({ observed: event.target.value })}
              className="aurfy-input min-h-[168px] font-mono text-[12px] leading-relaxed"
              placeholder="• [Fictional demo signal] … — what the source actually describes."
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="brief-hypotheses" className="field-label mb-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/15 text-[10px] font-bold text-warning">2</span>
                Hypotheses · inference
              </Label>
              <span className="text-[10px] text-muted-foreground">{brief.hypotheses.length} chars</span>
            </div>
            <p className="mb-2 mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Your team&apos;s interpretation. Keep the word “may”, not “will”. These are not findings.
            </p>
            <Textarea
              id="brief-hypotheses"
              value={brief.hypotheses}
              onChange={(event) => updateBrief({ hypotheses: event.target.value })}
              className="aurfy-input min-h-[140px] font-mono text-[12px] leading-relaxed"
              placeholder="• Payment friction at the handoff may … (Inference.)"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="brief-unknowns" className="field-label mb-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">3</span>
                Unknowns
              </Label>
              <span className="text-[10px] text-muted-foreground">{brief.unknowns.length} chars</span>
            </div>
            <p className="mb-2 mt-1 text-[11px] leading-relaxed text-muted-foreground">
              What you would need to check, and which claims this evidence cannot support.
            </p>
            <Textarea
              id="brief-unknowns"
              value={brief.unknowns}
              onChange={(event) => updateBrief({ unknowns: event.target.value })}
              className="aurfy-input min-h-[140px] font-mono text-[12px] leading-relaxed"
              placeholder="• No volume, conversion or payment-cost data was supplied."
            />
          </div>
        </div>

        <div className="mt-5">
          <ReviewToggle
            checked={brief.reviewed}
            onChange={(value) => {
              updateBrief({ reviewed: value });
              if (value) toast.success("Brief marked reviewed", { description: "Editing the brief again will clear this sign-off." });
            }}
            title="I reviewed this brief with a human eye"
            description="Evidence is labeled, hypotheses say they are hypotheses, and unknowns are stated rather than invented. Editing again clears this sign-off."
          />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Evidence ledger"
          title="Every card behind this brief"
          description="Provenance stays attached. A demo card never becomes a citation."
        />
        <ul className="mt-3 space-y-2">
          {selectedSignals.map((signal) => (
            <li key={signal.id} className="surface p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill tone={signal.category === "customer" ? "primary" : "neutral"}>{CATEGORY_LABEL[signal.category]}</Pill>
                <Pill
                  tone={
                    signal.provenance === "public"
                      ? "primary"
                      : signal.provenance === "demo" || signal.provenance === "clay"
                        ? "warning"
                        : "outline"
                  }
                >
                  {PROVENANCE_LABEL[signal.provenance]}
                </Pill>
                <Pill tone="outline">{signal.confidence} confidence</Pill>
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-snug text-foreground">{signal.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {signal.sourceName} · {signal.sourceUrl}
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
                {signal.sourceDate
                  ? `Source date ${signal.sourceDate}. `
                  : signal.provenance === "public"
                    ? "No publication date was stated on the public page. "
                    : signal.provenance === "clay"
                      ? "Simulated record with no real publication or retrieval date. "
                      : "No real publication date supplied. "}
                {signal.retrievedAt
                  ? `Read for this snapshot ${formatDateTime(signal.retrievedAt)}. `
                  : signal.provenance === "clay"
                    ? "Not retrieved — synthetic. "
                    : "Not retrieved by this app. "}
                {signal.limitations}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
        <p className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            Demo signals are fabricated and have no real source, date or engagement figure. Signals you paste are not opened,
            fetched or verified by this app. Do not present this brief as independently researched.
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Step 3 saved locally. Signals feed still has {signals.length - selectedSignals.length} unselected cards.
        </p>
        <Button asChild className="tap min-h-11">
          <Link to="/positioning">
            Next: choose a positioning angle
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
