import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ImagePlus,
  Layers,
  Loader2,
  Palette,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { ANGLES, CONCEPT_PALETTES } from "@/aurfy/content";
import { templateConcept } from "@/aurfy/draft";
import { useOnline } from "@/aurfy/use-online";
import { useConceptVisual } from "@/aurfy/use-concept-visual";
import { formatDateTime, resizeImageFile } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { BrandMark } from "@/components/aurfy/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, EmptyState, Pill, ReviewToggle, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

const FOOTER = "Illustrative concept for discussion. No partnership implied.";

export default function Concept() {
  const { merchant, selectedSignals, positioning, concept, pipeline, updateConcept, setStage, updatePipeline, capabilityById } = useStudio();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const online = useOnline();
  const visual = useConceptVisual();

  useEffect(() => {
    setImageLoadError(false);
  }, [concept.imageUrl]);
  const palette = CONCEPT_PALETTES.find((item) => item.id === concept.palette) ?? CONCEPT_PALETTES[0];
  const angle = ANGLES.find((item) => item.id === positioning.angle);
  const signal = selectedSignals.find((item) => item.id === concept.signalId);
  const usableCapabilities = positioning.capabilities.filter((capability) => positioning.capabilityIds.includes(capability.id));
  const capability = capabilityById(concept.capabilityId);

  const conceptText = useMemo(
    () =>
      [
        `Illustrative concept — ${concept.merchantDisplayName || merchant.name} × Aurfy`,
        concept.headline || "Headline not set",
        concept.subhead || "Supporting line not set",
        "",
        `Angle: ${angle?.label ?? "No angle chosen"}`,
        `Grounding signal: ${signal?.title ?? "No signal chosen"}`,
        signal ? `Signal provenance: ${signal.provenance === "demo" ? "Fictional demo signal" : "User-supplied, unverified"}` : "",
        `Approved capability: ${capability?.statement ?? "No capability chosen"}`,
        `Visual: ${concept.imageUrl ? "AI-generated illustrative artwork (not a logo or partnership asset)" : "No generated visual"}`,
        "",
        FOOTER,
      ]
        .filter(Boolean)
        .join("\n"),
    [concept, merchant.name, angle, signal, capability],
  );

  const onLogo = async (file: File | undefined) => {
    if (!file) return;
    setLogoBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      updateConcept({ logoDataUrl: dataUrl });
      toast.success("Logo added to the illustrative concept", { description: "Resized to 360px and stored only in this browser." });
    } catch (error) {
      toast.error("Logo could not be added", {
        description: error instanceof Error ? error.message : "Choose a PNG, JPG or WebP file.",
      });
    } finally {
      setLogoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const generateVisual = async () => {
    if (!concept.headline.trim()) {
      toast.error("Add a headline first", { description: "The visual is built from the concept, so it needs a short headline." });
      return;
    }
    const result = await visual.generate({
      headline: concept.headline,
      subhead: concept.subhead,
      merchantName: concept.merchantDisplayName || merchant.name,
      category: merchant.category,
      angle: angle?.label ?? "",
      palette: concept.palette,
    });
    if (!result.ok) {
      toast.error("Visual not generated", { description: result.reason });
      return;
    }
    updateConcept({
      imageUrl: result.url,
      imagePrompt: result.prompt,
      imageGeneratedAt: new Date().toISOString(),
    });
    toast.success("Illustrative visual generated", {
      description: "Seedream 5 artwork. Labeled illustrative; no logo, readable text or partnership is implied.",
    });
  };

  const generateCopy = () => {
    const groundingSignal = signal ?? selectedSignals[0];
    const groundingCapability = capability ?? usableCapabilities[0];
    const copy = templateConcept(merchant, groundingSignal, groundingCapability, positioning.angle);
    updateConcept({ ...copy, signalId: groundingSignal?.id ?? null, capabilityId: groundingCapability?.id ?? null });
    toast.success("Template copy applied", { description: "Deterministic wording from the chosen angle and capability. Edit freely." });
  };

  if (!positioning.angle || usableCapabilities.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader step={5} eyebrow="Co-brand concept" title="An illustrative idea, clearly framed." />
        <EmptyState
          icon={Layers}
          title="Choose an angle and capability first"
          description="The concept can only use reviewed Aurfy positioning. Go back to positioning and select one angle plus at least one approved capability."
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
        step={5}
        eyebrow="Micro co-branded concept"
        title="An illustrative idea, clearly framed."
        description="One editable concept card for discussion. The footer disclaimer stays visible in the preview and in anything you copy."
        action={<Pill tone={concept.reviewed ? "success" : "warning"}>{concept.reviewed ? "Reviewed" : "Draft"}</Pill>}
      />

      <TruthNote tone="safety" title="Not a real partnership or a live product" icon={ShieldCheck}>
        This is a designerly conversation aid, not a partnership asset. It does not promise a launch, commercial terms, a merchant
        endorsement or a specific implementation. Any AI-generated visual is illustrative and must not be presented as an official
        asset.
      </TruthNote>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        {/* Preview */}
        <div className="lg:sticky lg:top-20">
          <div className="mx-auto w-full max-w-md">
            <div
              className="aurfy-grain relative overflow-hidden rounded-[30px] border border-border/60 p-5 shadow-lift sm:p-6"
              style={{ background: palette.panel, color: palette.ink }}
              aria-label="Illustrative co-branded concept preview"
            >
              {concept.imageUrl && !imageLoadError ? (
                <div className="relative -mx-5 -mt-5 mb-4 sm:-mx-6 sm:-mt-6">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={concept.imageUrl}
                      alt={`AI-generated illustrative concept artwork for ${concept.merchantDisplayName || merchant.name}; not a real partnership.`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={() => setImageLoadError(true)}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, rgba(9,9,18,0.34) 0%, rgba(9,9,18,0) 38%, rgba(9,9,18,0.5) 100%)" }}
                      aria-hidden="true"
                    />
                    <span className="aurfy-chip absolute left-3 top-3 border-0 bg-background/90 text-[9px] text-foreground backdrop-blur">
                      AI visual · illustrative
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[8.5px] font-medium text-foreground backdrop-blur">
                      No partnership implied
                    </span>
                  </div>
                </div>
              ) : null}

              {!concept.imageUrl || imageLoadError ? (
              <svg className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 opacity-20" viewBox="0 0 200 200" aria-hidden="true">
                <g fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round">
                  <path d="M30 150a60 60 0 0 1 60-60" />
                  <path d="M30 110a100 100 0 0 1 100 100" />
                  <path d="M30 70a140 140 0 0 1 140 140" />
                </g>
              </svg>
              ) : null}

              <div className="relative flex items-start justify-between gap-3">
                <span className="font-mono-label rounded-full px-2.5 py-1 text-[8.5px]" style={{ background: palette.accent, color: "hsl(234 30% 13%)" }}>
                  Illustrative concept
                </span>
                <span className="font-mono-label text-[8.5px]" style={{ color: palette.ink, opacity: 0.6 }}>
                  Not a partnership
                </span>
              </div>

              <div className="relative mt-6 flex items-center gap-2.5">
                {concept.logoDataUrl ? (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1" style={{ background: "hsl(45 40% 97%)" }}>
                    <img src={concept.logoDataUrl} alt={`${merchant.name} uploaded logo`} className="h-full w-full object-contain" />
                  </span>
                ) : (
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[13px] font-bold"
                    style={{ background: "hsl(45 40% 97%)", color: "hsl(234 30% 15%)" }}
                  >
                    {(concept.merchantDisplayName || merchant.name).slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[13px] font-semibold">{concept.merchantDisplayName || merchant.name}</p>
                  <p className="flex items-center gap-1 text-[10px]" style={{ opacity: 0.62 }}>
                    <span>×</span>
                    <BrandMark className="h-3.5 w-3.5" />
                    Aurfy
                  </p>
                </div>
              </div>

              <h2 className="relative mt-6 font-display text-[32px] leading-[1.02] tracking-tight sm:text-[38px]">
                {concept.headline || "Your headline lands here"}
              </h2>
              <p className="relative mt-2.5 text-[12.5px] leading-relaxed" style={{ opacity: 0.82 }}>
                {concept.subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
              </p>

              <div className="relative mt-5 rounded-2xl border p-3" style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" }}>
                <p className="font-mono-label text-[8px] tracking-[0.14em]" style={{ opacity: 0.6 }}>
                  Approved Aurfy capability
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-[11.5px] leading-relaxed">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: palette.accent }} aria-hidden="true" />
                  {capability?.statement ?? "No capability selected yet."}
                </p>
              </div>

              <div
                className="relative mt-3 rounded-xl border px-3 py-2"
                style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono-label text-[7.5px] tracking-[0.14em]" style={{ opacity: 0.55 }}>
                    Signal behind the idea
                  </span>
                  {angle ? (
                    <span className="rounded-full px-1.5 py-0.5 text-[8px] font-medium" style={{ background: "rgba(255,255,255,0.1)" }}>
                      {angle.label}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug" style={{ opacity: 0.85 }}>
                  {signal ? signal.title : "No grounding signal selected."}
                </p>
                <p className="mt-1 text-[8.5px]" style={{ opacity: 0.5 }}>
                  {signal?.provenance === "demo" ? "Fictional demo signal — not verified" : signal ? "User-supplied — not independently verified" : "Not evidence"}
                </p>
              </div>

              <div className="relative mt-4 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                <p className="text-[9px] leading-relaxed" style={{ opacity: 0.62 }}>
                  {FOOTER}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>Preview updates as you edit. Nothing is published.</span>
              <CopyButton text={conceptText} label="Copy concept" variant="outline" className="min-h-9 w-auto px-3 text-[11px]" />
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <section className="surface p-4 sm:p-5">
            <SectionHeading eyebrow="Card content" title="What the merchant would see" description="Short, plain, and visibly a concept. Edit any line." />

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="concept-merchant" className="field-label mb-0">
                    Merchant display name
                  </Label>
                  <span className="text-[10px] text-muted-foreground">{concept.merchantDisplayName.length}/40</span>
                </div>
                <Input
                  id="concept-merchant"
                  value={concept.merchantDisplayName}
                  maxLength={40}
                  onChange={(event) => updateConcept({ merchantDisplayName: event.target.value })}
                  className="aurfy-input mt-2"
                  placeholder={merchant.name}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="concept-headline" className="field-label mb-0">
                    Headline
                  </Label>
                  <span className="text-[10px] text-muted-foreground">{concept.headline.length}/64</span>
                </div>
                <Input
                  id="concept-headline"
                  value={concept.headline}
                  maxLength={64}
                  onChange={(event) => updateConcept({ headline: event.target.value })}
                  className="aurfy-input mt-2 font-display text-lg"
                  placeholder="One payment layer. Every counter."
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="concept-subhead" className="field-label mb-0">
                    Supporting line
                  </Label>
                  <span className="text-[10px] text-muted-foreground">{concept.subhead.length}/220</span>
                </div>
                <Textarea
                  id="concept-subhead"
                  value={concept.subhead}
                  maxLength={220}
                  onChange={(event) => updateConcept({ subhead: event.target.value })}
                  className="aurfy-input mt-2 min-h-[88px] text-[13px]"
                  placeholder="A short, non-committal line about the experience."
                />
              </div>

              <div>
                <Label htmlFor="concept-signal" className="field-label">
                  Grounding signal
                </Label>
                <select
                  id="concept-signal"
                  value={concept.signalId ?? ""}
                  onChange={(event) => updateConcept({ signalId: event.target.value || null })}
                  className="aurfy-input h-12 min-h-12 text-[13px]"
                >
                  <option value="">No signal — keep it generic</option>
                  {selectedSignals.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.provenance === "demo" ? "Demo · " : "User · "}
                      {item.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {selectedSignals.length === 0
                    ? "No signals are selected. Add a selected signal before saving this concept."
                    : "Only selected signals appear. Provenance is shown on the concept, never hidden."}
                </p>
                {!concept.signalId && selectedSignals[0] ? (
                  <button
                    type="button"
                    onClick={() => updateConcept({ signalId: selectedSignals[0].id })}
                    className="mt-1.5 inline-flex min-h-8 items-center rounded-full border border-primary/25 bg-primary-soft px-2.5 text-[10.5px] font-semibold text-primary"
                  >
                    Use “{selectedSignals[0].title}”
                  </button>
                ) : null}
              </div>

              <div>
                <Label htmlFor="concept-capability" className="field-label">
                  Approved capability
                </Label>
                <select
                  id="concept-capability"
                  value={concept.capabilityId ?? ""}
                  onChange={(event) => updateConcept({ capabilityId: event.target.value || null })}
                  className="aurfy-input h-12 min-h-12 text-[13px]"
                >
                  <option value="">Choose an approved capability…</option>
                  {usableCapabilities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                      {item.edited ? " (edited by you)" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {capability?.statement ?? "Choose one of the approved capabilities from positioning."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" className="tap min-h-11" onClick={generateCopy}>
                  <Wand2 className="h-4 w-4" />
                  Suggest template copy
                </Button>
                <Link
                  to="/positioning"
                  className="tap min-h-11 border border-input bg-card px-4 text-foreground hover:bg-secondary"
                >
                  Edit positioning
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section className="surface p-4 sm:p-5">
            <SectionHeading eyebrow="Brand treatment" title="Palette & optional logo" description="Four deliberate palettes. A logo is optional and stays on this device." />

            <fieldset className="mt-4">
              <legend className="field-label">Accent palette</legend>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Concept colour palette">
                {CONCEPT_PALETTES.map((option) => {
                  const active = concept.palette === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => updateConcept({ palette: option.id })}
                      className={cn(
                        "flex min-h-[62px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-[10px] font-semibold transition",
                        active ? "border-primary/50 bg-primary-soft/40 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/30",
                      )}
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border"
                        style={{ background: option.swatch }}
                        aria-hidden="true"
                      >
                        {active ? <Check className="h-3.5 w-3.5" style={{ color: option.id === "citron" ? "hsl(234 30% 13%)" : "hsl(45 60% 98%)" }} /> : null}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-4">
              <Label htmlFor="concept-logo" className="field-label">
                Logo (optional)
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  id="concept-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(event) => onLogo(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={logoBusy}
                  className="tap min-h-11 border border-input bg-card px-4 text-foreground hover:bg-secondary"
                >
                  <Upload className="h-4 w-4" />
                  {logoBusy ? "Processing…" : concept.logoDataUrl ? "Replace logo" : "Upload logo"}
                </button>
                {concept.logoDataUrl ? (
                  <button
                    type="button"
                    onClick={() => updateConcept({ logoDataUrl: null })}
                    className="tap min-h-11 border border-input bg-card px-3 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
                <span className="text-[10px] text-muted-foreground">PNG/JPG/WebP/SVG · resized locally · not uploaded</span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                <ImagePlus className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                Only upload a logo you are allowed to use. The prototype does not fetch brand assets automatically.
              </p>
            </div>
          </section>

          <section className="surface p-4 sm:p-5">
            <SectionHeading
              eyebrow="Illustrative visual"
              title="Optional AI artwork"
              description="Generate a presentation mood image from this concept. It is illustrative only — never a merchant logo, official asset or proof of partnership."
            />

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Pill tone="primary" icon={Sparkles}>
                Seedream 5
              </Pill>
              <Pill tone="outline">4:3 · 2K</Pill>
              <Pill tone="outline">Uses AI credits</Pill>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Sends the display name, category, headline, supporting line, angle and palette. It does not send selected signal text or
              any pasted source. The backend requests no text, logos, trademarks or partnership marks.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="tap min-h-11"
                onClick={generateVisual}
                disabled={!online || visual.isGenerating || !concept.headline.trim()}
                aria-busy={visual.isGenerating}
              >
                {visual.isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {visual.phase === "submitting"
                  ? "Starting…"
                  : visual.phase === "polling"
                    ? "Generating visual…"
                    : concept.imageUrl
                      ? "Regenerate visual"
                      : "Generate visual"}
              </Button>
              {concept.imageUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    updateConcept({ imageUrl: null, imagePrompt: null, imageGeneratedAt: null });
                    toast.success("Generated visual removed", { description: "The concept card has returned to the typographic treatment." });
                  }}
                  className="tap min-h-11 border border-input bg-card px-4 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove visual
                </button>
              ) : null}
            </div>

            {!online ? (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-warning">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                You are offline. Generating a visual needs a connection; existing visuals already saved on this device still display.
              </p>
            ) : null}

            {!concept.headline.trim() ? (
              <p className="mt-2 text-[11px] text-muted-foreground">Add a headline above before generating artwork.</p>
            ) : null}

            {visual.isGenerating ? (
              <div className="mt-3" role="status" aria-live="polite">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                </div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  Usually 30–90 seconds. You can keep editing; the visual uses the copy from when you started.
                </p>
              </div>
            ) : null}

            {visual.error ? (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-relaxed text-destructive"
              >
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{visual.error}</span>
              </div>
            ) : null}

            {imageLoadError && concept.imageUrl ? (
              <p className="mt-3 rounded-xl border border-warning/25 bg-warning-soft/60 p-3 text-[11px] leading-relaxed text-warning">
                The saved visual URL could not be loaded — it may have expired. Regenerate or remove it.
              </p>
            ) : null}

            {concept.imageUrl && !imageLoadError ? (
              <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  <Pill tone="primary">AI-generated · illustrative</Pill>
                  Shown in the card preview. Regenerating replaces it and clears the review flag.
                </p>
                {concept.imagePrompt ? (
                  <details className="group mt-2 border-t border-border/70 pt-2">
                    <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-[10.5px] font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
                      Prompt sent to the image model
                      <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                      {concept.imagePrompt}
                    </p>
                    {concept.imageGeneratedAt ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">Generated {formatDateTime(concept.imageGeneratedAt)}</p>
                    ) : null}
                  </details>
                ) : null}
              </div>
            ) : null}

            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              The prompt forbids text, logos and trademarked identity, but image models can still add artefacts. Inspect every result before
              using it.
            </p>
          </section>

          <section className="surface p-4 sm:p-5">
            <SectionHeading eyebrow="Review & next action" title="A human decides" description="The concept stays a draft until someone confirms the wording and framing." />
            <div className="mt-4 space-y-3">
              <ReviewToggle
                checked={concept.reviewed}
                onChange={(value) => {
                  updateConcept({ reviewed: value });
                  if (value) toast.success("Concept marked reviewed", { description: "You can still edit; further edits clear the review flag." });
                }}
                title="I reviewed this illustrative concept"
                description="The footer is intact, any generated visual is labeled illustrative, signal provenance is visible, and no partnership or unapproved feature is implied."
              />

              {!concept.reviewed || !concept.signalId || !concept.capabilityId ? (
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-warning">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {!concept.signalId || !concept.capabilityId
                    ? "Choose a grounding signal and an approved capability before saving to the pipeline."
                    : "Save to pipeline is enabled after review. The preview is still available for discussion."}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  className="tap min-h-11"
                  disabled={!concept.reviewed || !concept.headline.trim() || !concept.signalId || !concept.capabilityId}
                  onClick={() => {
                    if (pipeline.stage === "research") {
                      setStage("concept_ready");
                    }
                    if (!pipeline.nextAction.trim()) {
                      updatePipeline({ nextAction: "Review the concept with the merchant and copy a manual outreach note" });
                    }
                    updateConcept({ reviewed: true });
                    toast.success("Concept marked ready", {
                      description:
                        pipeline.stage === "research"
                          ? "Pipeline moved to Concept ready. Nothing was shared automatically."
                          : "Pipeline already past Research; stage unchanged.",
                    });
                  }}
                >
                  <Check className="h-4 w-4" />
                  Save concept to pipeline
                </Button>
                <CopyButton text={conceptText} label="Copy for a document" variant="outline" />
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Copying is a manual action for a deck, email or message you send yourself. The app has no share, publish or DM
                integration.
              </p>
            </div>
          </section>

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-3 text-[10.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Footer text is fixed: “{FOOTER}”
            </span>
            <Link to="/outreach" className="hidden shrink-0 items-center gap-1 font-semibold text-primary sm:inline-flex">
              Outreach
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Palette className="h-3.5 w-3.5" aria-hidden="true" />
          The palette is presentation only. The angle and approved capability are set in positioning.
        </p>
        <Button asChild className="tap min-h-11">
          <Link to="/outreach">
            Next: write the outreach note
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Template copy is deterministic. The optional visual is AI-generated with Seedream 5 and labeled; no merchant logo or official brand asset is synthesized.
      </p>
    </div>
  );
}
