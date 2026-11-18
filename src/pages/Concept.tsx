import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Globe,
  ImagePlus,
  Layers,
  Loader2,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { ANGLES, CONCEPT_FONTS, CONCEPT_LAYOUTS, CONCEPT_PALETTES } from "@/aurfy/content";
import type { ConceptLayoutId } from "@/aurfy/types";
import { templateConcept } from "@/aurfy/draft";
import { useOnline } from "@/aurfy/use-online";
import { useConceptVisual } from "@/aurfy/use-concept-visual";
import { fetchLivePage } from "@/aurfy/live-research";
import { PROVENANCE_DETAIL, PROVENANCE_LABEL, formatDateTime, initials, resizeImageFile } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { ConceptCard, CONCEPT_DISCLAIMER } from "@/components/aurfy/concept-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, EmptyState, Pill, ReviewToggle, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";


function LayoutMini({ id }: { id: ConceptLayoutId }) {
  return (
    <span className="flex h-12 w-full flex-col gap-1 overflow-hidden rounded-lg border border-border bg-card p-1.5" aria-hidden="true">
      {id === "editorial" ? (
        <>
          <span className="h-4 w-full rounded bg-primary/25" />
          <span className="h-1 w-3/4 rounded bg-muted-foreground/25" />
          <span className="h-1 w-1/2 rounded bg-muted-foreground/20" />
        </>
      ) : null}
      {id === "cover" ? (
        <span className="relative h-full w-full rounded bg-primary/25">
          <span className="absolute inset-x-1 bottom-1 h-1 w-1/2 rounded bg-card/80" />
        </span>
      ) : null}
      {id === "split" ? (
        <>
          <span className="h-1 w-2/3 rounded bg-muted-foreground/25" />
          <span className="h-1 w-1/2 rounded bg-muted-foreground/20" />
          <span className="mt-auto h-4 w-full rounded bg-primary/25" />
        </>
      ) : null}
      {id === "poster" ? (
        <>
          <span className="h-5 w-full rounded bg-primary/25" />
          <span className="h-2.5 w-4/5 rounded bg-accent" />
          <span className="h-1 w-1/2 rounded bg-muted-foreground/20" />
        </>
      ) : null}
      {id === "type" ? (
        <>
          <span className="h-1 w-1/3 rounded bg-muted-foreground/20" />
          <span className="mt-1 h-1.5 w-full rounded bg-muted-foreground/30" />
          <span className="h-1.5 w-4/5 rounded bg-muted-foreground/30" />
          <span className="mt-auto h-1 w-1/2 rounded bg-primary/30" />
        </>
      ) : null}
    </span>
  );
}

export default function Concept() {
  const { merchant, selectedSignals, positioning, concept, pipeline, updateConcept, setStage, updatePipeline, capabilityById } = useStudio();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoFetchBusy, setLogoFetchBusy] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const online = useOnline();
  const visual = useConceptVisual();

  useEffect(() => {
    setImageLoadError(false);
  }, [concept.imageUrl]);
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
        signal ? `Signal provenance: ${PROVENANCE_DETAIL[signal.provenance]}` : "",
        `Approved capability: ${capability?.statement ?? "No capability chosen"}`,
        `Art direction: ${CONCEPT_LAYOUTS.find((item) => item.id === (concept.layout ?? "editorial"))?.label ?? "Editorial"} · ${
          CONCEPT_FONTS.find((item) => item.id === (concept.displayFont ?? "bodoni"))?.label ?? "Bodoni Moda"
        }`,
        `Visual: ${
          concept.sendSafe
            ? "Redacted for send — merchant logo and generated imagery omitted"
            : concept.imageUrl
              ? "AI-generated illustrative artwork (not a logo or partnership asset)"
              : "No generated visual"
        }`,
        concept.logoDataUrl && !concept.sendSafe ? `Logo: ${concept.logoDataUrl.startsWith("/logos/") ? "fictional demo mark" : "provided by you"}` : "",
        concept.sendSafe ? "Send-safe version: logos and illustrations removed. Written concept only." : "",
        "",
        CONCEPT_DISCLAIMER,
      ]
        .filter(Boolean)
        .join("\n"),
    [concept, merchant.name, angle, signal, capability],
  );

  const fetchLogoFromSite = async () => {
    if (!merchant.url) {
      toast.error("No merchant URL", { description: "Add the merchant's website in intake first." });
      return;
    }
    setLogoFetchBusy(true);
    const outcome = await fetchLivePage(merchant.url);
    if (outcome.ok && outcome.data.page.logoUrl) {
      updateConcept({ logoDataUrl: outcome.data.page.logoUrl });
      toast.success("Logo pulled from the public site", {
        description: "Illustrative use only. Remove or replace it if you do not have permission.",
      });
    } else {
      toast.error("No usable logo found", {
        description: outcome.ok ? "The page did not expose a public logo; upload one instead." : outcome.reason,
      });
    }
    setLogoFetchBusy(false);
  };

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
          <div className="mx-auto w-full max-w-md" role="region" aria-label="Illustrative co-branded concept preview">
            <ConceptCard
              merchantName={concept.merchantDisplayName || merchant.name}
              initials={initials(concept.merchantDisplayName || merchant.name)}
              category={merchant.category}
              angleLabel={angle?.label}
              headline={concept.headline}
              subhead={concept.subhead}
              capability={capability?.label}
              signalNote={
                signal
                  ? `${PROVENANCE_LABEL[signal.provenance]}: ${signal.title}`
                  : undefined
              }
              palette={concept.palette}
              layout={concept.layout ?? "editorial"}
              fontId={concept.displayFont ?? "bodoni"}
              imageUrl={concept.imageUrl}
              imageAlt={`AI-generated illustrative concept artwork for ${concept.merchantDisplayName || merchant.name}; not a real partnership.`}
              logoUrl={concept.logoDataUrl}
              redacted={Boolean(concept.sendSafe)}
              onImageError={() => setImageLoadError(true)}
              className="shadow-lift"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>
                {concept.sendSafe
                  ? "Send-safe preview: logo, imagery and illustrations removed."
                  : "Preview updates as you edit. Nothing is published."}
              </span>
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
                  style={{
                    fontFamily: (CONCEPT_FONTS.find((font) => font.id === (concept.displayFont ?? "bodoni")) ?? CONCEPT_FONTS[0]).stack,
                    fontWeight: (CONCEPT_FONTS.find((font) => font.id === (concept.displayFont ?? "bodoni")) ?? CONCEPT_FONTS[0]).weight,
                  }}
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
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="concept-logo" className="field-label mb-0">
                  Logo (optional)
                </Label>
                {concept.logoDataUrl?.startsWith("/logos/") ? <Pill tone="warning">Fictional demo mark</Pill> : null}
                {concept.logoDataUrl?.startsWith("http") ? <Pill tone="primary">Public site logo</Pill> : null}
                {concept.logoDataUrl && !concept.logoDataUrl.startsWith("/logos/") && !concept.logoDataUrl.startsWith("http") ? (
                  <Pill tone="outline">Uploaded by you</Pill>
                ) : null}
              </div>
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
              <button
                type="button"
                onClick={() => void fetchLogoFromSite()}
                disabled={logoFetchBusy || !online || !merchant.url}
                className="tap mt-2 min-h-10 border border-input bg-card px-3 text-[11px] text-foreground hover:bg-secondary disabled:opacity-50"
              >
                {logoFetchBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                {logoFetchBusy ? "Looking for a public logo…" : "Fetch logo from public site"}
              </button>
              <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                <ImagePlus className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                Demo marks are fictional. Logos pulled from a public site are used for illustrative discussion only — use them only with
                permission. Send-safe mode hides the logo entirely.
              </p>
            </div>
          </section>

          <section className="surface p-4 sm:p-5">
            <SectionHeading
              eyebrow="Art direction"
              title="A layout and typeface per concept"
              description="Five layouts and four display faces. Each merchant can carry its own art direction; changing either clears the review flag."
            />

            <fieldset className="mt-4">
              <legend className="field-label">Layout</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONCEPT_LAYOUTS.map((item) => {
                  const active = (concept.layout ?? "editorial") === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={`Use ${item.label} layout`}
                      onClick={() => updateConcept({ layout: item.id })}
                      className={cn(
                        "rounded-xl border p-2 text-left transition",
                        active ? "border-primary/50 bg-primary-soft/40 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/30",
                      )}
                    >
                      <LayoutMini id={item.id} />
                      <span className="mt-1.5 block text-[11px] font-semibold text-foreground">{item.label}</span>
                      <span className="mt-0.5 block text-[9.5px] leading-snug text-muted-foreground">{item.note}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="field-label">Typeface</legend>
              <div className="grid grid-cols-2 gap-2">
                {CONCEPT_FONTS.map((font) => {
                  const active = (concept.displayFont ?? "bodoni") === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      aria-pressed={active}
                      aria-label={`Use ${font.label} typeface`}
                      onClick={() => updateConcept({ displayFont: font.id })}
                      className={cn(
                        "min-h-[74px] rounded-xl border p-2.5 text-left transition",
                        active ? "border-primary/50 bg-primary-soft/40 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/30",
                      )}
                    >
                      <span className="block text-[26px] leading-none text-foreground" style={{ fontFamily: font.stack, fontWeight: font.weight }}>
                        Aa
                      </span>
                      <span className="mt-1.5 block text-[11px] font-semibold text-foreground">{font.label}</span>
                      <span className="mt-0.5 block text-[9.5px] leading-snug text-muted-foreground">{font.note}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
            <SectionHeading
              eyebrow="Convert for send"
              title="Redact for external sharing"
              description="If merchant logos or generated imagery should not leave the studio, switch to a text-only send-safe version."
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="tap min-h-11"
                onClick={() => {
                  updateConcept({ sendSafe: !concept.sendSafe });
                  toast.success(concept.sendSafe ? "Full concept restored" : "Converted to send-safe preview", {
                    description: concept.sendSafe
                      ? "The logo, visual and illustrations are visible again. Review the concept again."
                      : "The preview now omits the merchant logo, generated visual and illustration. The written concept and disclaimer remain.",
                  });
                }}
              >
                {concept.sendSafe ? <RotateCcw className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {concept.sendSafe ? "Restore full concept" : "Redact logos & imagery"}
              </Button>
              <Pill tone={concept.sendSafe ? "success" : "neutral"}>{concept.sendSafe ? "Send-safe" : "Full preview"}</Pill>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Send-safe removes the merchant logo, the AI-generated visual, the payment-journey illustration and the decorative category
              mark. It keeps the headline, approved capability, signal note and the exact footer disclaimer. The original assets stay stored
              so you can restore this preview.
            </p>
            {concept.sendSafe ? (
              <p className="mt-2 rounded-xl border border-success/25 bg-success-soft/50 p-2.5 text-[10.5px] leading-relaxed text-success">
                Send-safe preview is active and uses the type-led layout regardless of the selected layout. Use “Copy concept” under the
                preview to share the text-only version; nothing is sent automatically.
              </p>
            ) : null}
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
                description="The footer is intact, the layout and typeface are intentional, any generated visual is labeled illustrative, signal provenance is visible, and no partnership is implied."
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
              Footer text is fixed: “{CONCEPT_DISCLAIMER}”
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
          Palette, layout and typeface are presentation only. The angle and approved capability are set in positioning.
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
        Template copy is deterministic. Five layouts and four typefaces are stored per concept; visuals are labeled, and send-safe mode
        removes logos and imagery. No merchant logo or official brand asset is synthesized.
      </p>
    </div>
  );
}
