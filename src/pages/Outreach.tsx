import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  ClipboardCheck,
  CornerDownRight,
  Mail,
  MessageSquareQuote,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { AI_AVAILABLE, AI_MODEL_LABEL, requestAiOutreach } from "@/aurfy/ai";
import { useOnline } from "@/aurfy/use-online";
import { ANGLES } from "@/aurfy/content";
import { templateOutreach } from "@/aurfy/draft";
import { composeMessage, formatDateTime } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CopyButton, EmptyState, Pill, ReviewToggle, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

const FIELDS = [
  {
    key: "observation" as const,
    label: "Source observation",
    hint: "What the selected signal actually says. Keep provenance words such as demo or user-supplied.",
    placeholder: "I'm working through a note about … In our working notes: …",
    max: 420,
  },
  {
    key: "hypothesis" as const,
    label: "Hypothesis",
    hint: "Say it is a hypothesis. Keep may, not will. No invented data.",
    placeholder: "My hypothesis (not a finding): …",
    max: 420,
  },
  {
    key: "capability" as const,
    label: "Approved capability",
    hint: "Use the reviewed Aurfy wording. Do not add features, rates or client proof.",
    placeholder: "Aurfy can support …",
    max: 420,
  },
  {
    key: "question" as const,
    label: "One question",
    hint: "An open question the merchant can answer without doing homework.",
    placeholder: "When a guest …, what would you want to happen?",
    max: 280,
  },
];

export default function Outreach() {
  const {
    merchant,
    selectedSignals,
    positioning,
    concept,
    outreach,
    pipeline,
    updateOutreach,
    setStage,
    updatePipeline,
    capabilityById,
  } = useStudio();
  const online = useOnline();
  const [aiBusy, setAiBusy] = useState(false);

  const angle = ANGLES.find((item) => item.id === (outreach.angle ?? positioning.angle));
  const usableCapabilities = positioning.capabilities.filter((capability) => positioning.capabilityIds.includes(capability.id));
  const primarySignal = selectedSignals.find((signal) => signal.id === outreach.signalId);
  const capability = capabilityById(outreach.capabilityId);
  const message = useMemo(
    () =>
      composeMessage({
        observation: outreach.observation,
        hypothesis: outreach.hypothesis,
        capability: outreach.capability,
        question: outreach.question,
      }),
    [outreach],
  );
  const totalChars = message.length;
  const complete = FIELDS.every((field) => outreach[field.key].trim().length > 0);
  const canCopy = outreach.reviewed && complete;
  const generationLabel =
    outreach.generation === "ai" ? "AI-assisted" : outreach.generation === "template" ? "Template" : "Manual";

  const buildTemplate = (note?: string) => {
    const groundingSignal = primarySignal ?? selectedSignals[0];
    const groundingCapability = capability ?? usableCapabilities[0];
    const parts = templateOutreach(
      merchant,
      selectedSignals,
      positioning.angle,
      groundingCapability,
      groundingSignal?.id ?? null,
    );
    updateOutreach({
      ...parts,
      generation: "template",
      generationNote:
        note ??
        "Deterministic template built from the selected signal, positioning angle and approved capability. No AI model was used.",
      signalId: groundingSignal?.id ?? null,
      capabilityId: groundingCapability?.id ?? null,
      angle: positioning.angle,
      reviewed: false,
    });
  };

  const generateTemplate = () => {
    buildTemplate();
    toast.success("Template draft built", { description: "Edit the wording, then review before copying." });
  };

  const generateWithAi = async () => {
    setAiBusy(true);
    const result = await requestAiOutreach({
      merchant,
      signals: selectedSignals,
      angle: positioning.angle,
      capabilityIds: positioning.capabilityIds,
      capabilities: positioning.capabilities,
      chosenSignalId: primarySignal?.id ?? null,
    });
    if (result.ok) {
      updateOutreach({
        ...result.draft,
        generation: "ai",
        generationNote: `AI-assisted draft from ${result.model} via server-side AI. Review every part; AI output can still be wrong or overstate a claim.`,
        signalId: primarySignal?.id ?? selectedSignals[0]?.id ?? null,
        capabilityId: capability?.id ?? usableCapabilities[0]?.id ?? null,
        angle: positioning.angle,
        reviewed: false,
      });
      toast.success("AI-assisted draft ready", {
        description: "Still a draft. Review the provenance and capability wording before copying.",
      });
    } else {
      buildTemplate(
        "AI drafting was unavailable, so this is the deterministic template. It uses only your selected signal and approved capability. Review before copying.",
      );
      toast.warning("AI unavailable — deterministic template used", { description: result.reason });
    }
    setAiBusy(false);
  };

  if (!positioning.angle || usableCapabilities.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader step={6} eyebrow="Outreach draft" title="A short note, copied by a human." />
        <EmptyState
          icon={MessageSquareQuote}
          title="Positioning is not ready"
          description="The draft must use a reviewed angle and approved capability wording. Finish positioning first."
          action={
            <Button asChild className="tap w-full">
              <Link to="/positioning">
                Open positioning
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
        step={6}
        eyebrow="Outreach draft"
        title="A short note, copied by a human."
        description="Four parts: what you observed, what you suspect, what Aurfy can actually do, and one question. The app never sends it."
        action={<Pill tone={outreach.reviewed ? "success" : "warning"}>{outreach.reviewed ? "Reviewed" : "Needs review"}</Pill>}
      />

      <TruthNote tone="safety" title="No send button exists" icon={ShieldCheck}>
        There is no email, DM, LinkedIn, social or CRM integration. Copying writes to your clipboard; everything after that is your
        manual action in a tool of your choice.
      </TruthNote>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4">
          <section className="surface p-4 sm:p-5">
            <SectionHeading
              eyebrow="Draft source"
              title="What this note leans on"
              description="Change the grounding signal or capability here; then rebuild or edit the four fields."
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="outreach-signal" className="field-label">
                  Signal
                </Label>
                <select
                  id="outreach-signal"
                  value={outreach.signalId ?? ""}
                  onChange={(event) => updateOutreach({ signalId: event.target.value || null, reviewed: false })}
                  className="aurfy-input h-12 min-h-12 text-[12.5px]"
                >
                  <option value="">No signal — keep generic</option>
                  {selectedSignals.map((signal) => (
                    <option key={signal.id} value={signal.id}>
                      {signal.provenance === "demo" ? "Demo · " : "User · "}
                      {signal.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="outreach-capability" className="field-label">
                  Capability
                </Label>
                <select
                  id="outreach-capability"
                  value={outreach.capabilityId ?? ""}
                  onChange={(event) => updateOutreach({ capabilityId: event.target.value || null, reviewed: false })}
                  className="aurfy-input h-12 min-h-12 text-[12.5px]"
                >
                  <option value="">Choose a capability…</option>
                  {usableCapabilities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <Pill tone="neutral">{angle?.label ?? "No angle"}</Pill>
              {primarySignal ? (
                <Pill tone={primarySignal.provenance === "demo" ? "warning" : "outline"}>
                  {primarySignal.provenance === "demo" ? "Demo signal · fictional" : "User-supplied · unverified"}
                </Pill>
              ) : (
                <Pill tone="warning">No grounding signal</Pill>
              )}
              <span className="divider-dot">Draft must stay under ~1,100 characters to read like a note.</span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="tap min-h-11" onClick={generateTemplate}>
                <Wand2 className="h-4 w-4" />
                {outreach.observation ? "Rebuild from template" : "Build from template"}
              </Button>
              <div className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                AI drafting: {AI_AVAILABLE ? "server-side, optional" : "not connected in this build"}
              </div>
            </div>
            {outreach.generationNote ? (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {outreach.generationNote}
              </p>
            ) : null}
          </section>

          <section className="surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionHeading eyebrow="The note" title="Four editable parts" description="Placeholders are not sent automatically; edit text directly." />
              <Pill tone={outreach.reviewed ? "success" : "warning"}>{generationLabel}</Pill>
            </div>

            <div className="mt-4 space-y-4">
              {FIELDS.map((field, index) => {
                const value = outreach[field.key];
                const over = value.length > field.max;
                return (
                  <div key={field.key}>
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={`outreach-${field.key}`} className="field-label mb-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {index + 1}
                        </span>
                        {field.label}
                      </Label>
                      <span className={cn("text-[10px]", over ? "font-semibold text-destructive" : "text-muted-foreground")}>
                        {value.length}/{field.max}
                      </span>
                    </div>
                    <p className="mb-2 mt-1 text-[11px] leading-relaxed text-muted-foreground">{field.hint}</p>
                    <Textarea
                      id={`outreach-${field.key}`}
                      value={value}
                      onChange={(event) => updateOutreach({ [field.key]: event.target.value.slice(0, field.max) } as never)}
                      className="aurfy-input min-h-[96px] text-[13px] leading-relaxed"
                      placeholder={field.placeholder}
                      aria-invalid={over}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border/70 pt-4">
              <ReviewToggle
                checked={outreach.reviewed}
                onChange={(value) => {
                  updateOutreach({ reviewed: value });
                  if (value) toast.success("Draft marked reviewed", { description: "Copy is now enabled. Nothing has been sent." });
                }}
                title="I reviewed all four parts"
                description="Provenance is honest, the hypothesis is labeled, the capability wording is approved, and the question is one the merchant can answer."
              />
            </div>
          </section>

          <section className="surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionHeading eyebrow="AI, explicitly" title="Optional drafting help" description="A deterministic template already works without AI. Any AI path is labeled." />
              <Pill tone={AI_AVAILABLE ? "primary" : "neutral"}>{AI_AVAILABLE ? "Server-side available" : "Not connected"}</Pill>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="tap min-h-11" onClick={generateTemplate}>
                <Wand2 className="h-4 w-4" />
                Use deterministic template
              </Button>
              <Button
                type="button"
                variant="outline"
                className="tap min-h-11"
                onClick={generateWithAi}
                disabled={aiBusy || !online || usableCapabilities.length === 0}
                title={!online ? "AI drafting needs a connection" : "Server-side AI receives only the merchant fields, selected cards and approved wording"}
              >
                {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiBusy ? "Drafting with AI…" : "Draft with AI"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {AI_AVAILABLE
                ? `Connected server-side with ${AI_MODEL_LABEL}. Only the selected signal cards, the merchant name/category/notes, the angle and approved capability wording are sent. AI can still be wrong, so all output requires review; if it is offline or fails, the deterministic template is applied and labeled as such.`
                : "This build does not call an AI service for outreach. No prompt or draft text is sent anywhere. The template path is complete on its own."}
            </p>
          </section>
        </div>

        {/* Preview / copy */}
        <div className="space-y-3 lg:sticky lg:top-20">
          <div className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
              <p className="font-mono-label text-[9px] text-muted-foreground">Manual copy preview</p>
              <Pill tone="neutral">{totalChars} chars</Pill>
            </div>
            <div className="p-4">
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {message || (
                  <span className="text-muted-foreground">
                    The note will appear here once you build or write the four parts.
                  </span>
                )}
              </div>
              <div className="mt-4 border-t border-border/70 pt-3 text-[10px] leading-relaxed text-muted-foreground">
                No greeting or signature is added. Add your own name and context when you paste it into your email client.
              </div>
            </div>
            <div className="space-y-2 border-t border-border/70 bg-muted/30 p-3">
              <CopyButton text={message} label="Copy draft" disabled={!canCopy} />
              <Button
                type="button"
                variant="outline"
                className="tap min-h-11 w-full"
                onClick={() => {
                  try {
                    const blob = new Blob([message], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = `${merchant.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-outreach.txt`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                    toast.success("Draft downloaded as a text file", { description: "Review it again before using it anywhere." });
                  } catch {
                    toast.error("Download failed", { description: "Copy the preview text instead." });
                  }
                }}
                disabled={!message.trim()}
              >
                <Mail className="h-4 w-4" />
                Save draft as .txt
              </Button>
              {!canCopy ? (
                <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-warning">
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  {!complete
                    ? "Fill in all four parts before copying."
                    : "Mark the draft reviewed to enable copy."}
                </p>
              ) : (
                <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-success">
                  <Check className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  Copy is enabled. Nothing is sent from this app.
                </p>
              )}
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                If your browser blocks clipboard access, select the preview text and copy it manually.
              </p>
            </div>
          </div>

          <div className="surface p-4">
            <p className="font-mono-label text-[9px] text-muted-foreground">Record after you send</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Stage is manual. Log it only after you personally send the note.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" className="tap mt-3 min-h-11 w-full" disabled={!canCopy}>
                  <ClipboardCheck className="h-4 w-4" />
                  I sent it myself — log “Outreach sent”
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log outreach as sent?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This only records the stage in this browser. Aurfy did not send anything and cannot verify that a message was
                    delivered. Make sure you actually copied and sent it in your own tool.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Not yet</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setStage("outreach_sent");
                      updatePipeline({
                        nextAction: "Wait for a reply, then log the response manually",
                        notes: `${pipeline.notes ? `${pipeline.notes}\n` : ""}Outreach logged as manually sent on ${new Date().toLocaleDateString("en-GB")}. No message was sent by the app.`,
                      });
                      toast.success("Stage logged as Outreach sent", { description: "Manual record only. No delivery status is implied." });
                    }}
                  >
                    Confirm manual send
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Current stage: {pipeline.stage.replace(/_/g, " ")}. Follow-ups are not scheduled automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-3 text-[10.5px] leading-relaxed text-muted-foreground">
            <p className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-warning" aria-hidden="true" />
              Never paste confidential merchant data, private contact details or unverified claims into this prototype. Draft text is
              stored unencrypted in this browser&apos;s local storage.
            </p>
            <p className="mt-2 flex items-center gap-1.5">
              <CornerDownRight className="h-3 w-3 shrink-0" aria-hidden="true" />
              Concept reviewed: {concept.reviewed ? "yes" : "not yet"} · last edit {formatDateTime(outreach.updatedAt)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link to="/concept" className="text-[11px] font-semibold text-primary">
              Back to concept
            </Link>
            <Link to="/pipeline" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              Pipeline
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
