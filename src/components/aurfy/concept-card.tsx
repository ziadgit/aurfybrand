import { useState } from "react";
import { Check, Globe, Smartphone, Sparkles, Store } from "lucide-react";
import type { ConceptFontId, ConceptLayoutId, ConceptPaletteId } from "@/aurfy/types";
import { CONCEPT_FONTS, CONCEPT_PALETTES } from "@/aurfy/content";
import { clampText } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand";
import { BrandCrest, ConceptArtwork } from "./concept-art";
import { categoryGlyph } from "@/aurfy/category-glyph";

export const CONCEPT_DISCLAIMER = "Illustrative concept for discussion. No partnership implied.";

const OVERLAY_BORDER = "rgba(255,255,255,0.16)";
const SOFT_SURFACE = "rgba(255,255,255,0.07)";
const DARK_INK = "hsl(234 30% 13%)";

type ConceptCardProps = {
  merchantName: string;
  initials?: string;
  category?: string;
  angleLabel?: string;
  headline: string;
  subhead: string;
  capability?: string;
  signalNote?: string;
  palette: ConceptPaletteId;
  layout?: ConceptLayoutId;
  fontId?: ConceptFontId;
  imageUrl?: string | null;
  imageAlt?: string;
  logoUrl?: string | null;
  redacted?: boolean;
  className?: string;
  onImageError?: () => void;
};

function fontFor(id?: ConceptFontId) {
  return CONCEPT_FONTS.find((font) => font.id === id) ?? CONCEPT_FONTS[0];
}

function Journey({ accent, ink }: { accent: string; ink: string }) {
  const steps = [
    { label: "App", icon: Smartphone },
    { label: "Counter", icon: Store },
    { label: "Online", icon: Globe },
  ];
  return (
    <div className="mt-4 rounded-xl border p-2.5" style={{ borderColor: OVERLAY_BORDER, background: SOFT_SURFACE }}>
      <p className="font-mono-label text-[7.5px] tracking-[0.14em]" style={{ color: ink, opacity: 0.55 }}>
        One payment layer
      </p>
      <div className="mt-2 flex items-center gap-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex min-w-0 flex-1 items-center gap-1">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <Icon className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden="true" />
                <span className="text-[8px] font-medium" style={{ color: ink, opacity: 0.78 }}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span className="h-px w-3 shrink-0" style={{ background: "rgba(255,255,255,0.22)" }} aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConceptCard({
  merchantName,
  initials,
  category,
  angleLabel,
  headline,
  subhead,
  capability,
  signalNote,
  palette: paletteId,
  layout = "editorial",
  fontId,
  imageUrl,
  imageAlt,
  logoUrl,
  redacted = false,
  className,
  onImageError,
}: ConceptCardProps) {
  const palette = CONCEPT_PALETTES.find((item) => item.id === paletteId) ?? CONCEPT_PALETTES[0];
  const font = fontFor(fontId);
  const effectiveLayout: ConceptLayoutId = redacted ? "type" : layout;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasImage = Boolean(imageUrl) && !redacted && failedUrl !== imageUrl;
  const showLogo = Boolean(logoUrl) && !redacted;
  const CategoryIcon = categoryGlyph(category);
  const monogram = (initials || merchantName.slice(0, 2)).toUpperCase();

  const headlineStyle = {
    fontFamily: font.stack,
    fontWeight: font.weight,
    letterSpacing: "-0.012em",
  } as const;

  const Logo = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <BrandCrest
      name={merchantName}
      initials={initials ?? ""}
      logoUrl={logoUrl}
      accent={palette.accent}
      showLogo={showLogo}
      size={size}
    />
  );

  const Chips = ({ onImage = false }: { onImage?: boolean }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-[9px] font-semibold",
          onImage ? "bg-background/90 text-foreground backdrop-blur" : "border text-[9px]",
        )}
        style={onImage ? undefined : { borderColor: OVERLAY_BORDER, background: SOFT_SURFACE, color: palette.ink }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        {redacted ? "Send-safe preview" : "Illustrative concept"}
      </span>
      {hasImage && !redacted ? (
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-background/90 px-2.5 text-[9px] font-medium text-foreground backdrop-blur">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          AI-generated
        </span>
      ) : null}
      {redacted ? (
        <span
          className="inline-flex min-h-8 items-center rounded-full border px-2.5 text-[9px] font-medium"
          style={{ borderColor: OVERLAY_BORDER, color: palette.ink, opacity: 0.8 }}
        >
          Logos & imagery removed
        </span>
      ) : null}
    </div>
  );

  const Lockup = ({ dark = false, size = "md" }: { dark?: boolean; size?: "sm" | "md" }) => {
    const ink = dark ? DARK_INK : palette.ink;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo size={size} />
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold leading-tight" style={{ color: ink }}>
              {merchantName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10.5px]" style={{ color: ink, opacity: 0.68 }}>
              <span aria-hidden="true">×</span>
              <BrandMark className="h-4 w-4" />
              <span className="font-medium">Aurfy</span>
            </p>
          </div>
        </div>
        {angleLabel ? (
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-medium"
            style={
              dark
                ? { borderColor: "rgba(20,19,33,0.2)", background: "rgba(255,255,255,0.28)", color: DARK_INK }
                : { borderColor: OVERLAY_BORDER, background: SOFT_SURFACE, color: palette.ink }
            }
          >
            {angleLabel}
          </span>
        ) : null}
      </div>
    );
  };

  const Headline = ({ className: headlineClassName }: { className?: string }) => (
    <h2 className={cn("max-w-[18ch] text-[27px] leading-[1.06] sm:text-[31px]", headlineClassName)} style={{ ...headlineStyle, color: "inherit" }}>
      {headline || "Your headline lands here"}
    </h2>
  );

  const SignalLine = () =>
    signalNote ? (
      <p className="mt-2 flex items-start gap-1.5 text-[9.5px] leading-relaxed" style={{ color: palette.ink, opacity: 0.62 }}>
        <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: palette.accent }} aria-hidden="true" />
        <span>{clampText(signalNote, 120)}</span>
      </p>
    ) : null;

  const CapabilityRow = () => (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[9.5px] font-medium"
        style={{ borderColor: OVERLAY_BORDER, background: SOFT_SURFACE, color: palette.ink }}
      >
        <Check className="h-3 w-3 shrink-0" style={{ color: palette.accent }} aria-hidden="true" />
        {capability || "Approved capability to confirm"}
      </span>
      {category ? (
        <span
          className="hidden min-h-8 items-center rounded-full border px-2.5 text-[9px] font-medium sm:inline-flex"
          style={{ borderColor: "rgba(255,255,255,0.12)", color: palette.ink, opacity: 0.72 }}
        >
          {category}
        </span>
      ) : null}
    </div>
  );

  const Footer = ({ dark = false }: { dark?: boolean }) => {
    const ink = dark ? DARK_INK : palette.ink;
    const border = dark ? "rgba(20,19,33,0.18)" : OVERLAY_BORDER;
    return (
      <div className="mt-4 border-t pt-3" style={{ borderColor: border }}>
        <div className="flex items-end justify-between gap-3">
          <p className="max-w-[60%] text-[10px] leading-snug" style={{ color: ink, opacity: dark ? 0.72 : 0.75 }}>
            {CONCEPT_DISCLAIMER}
          </p>
          <span className="flex shrink-0 items-center gap-1.5" aria-label="Aurfy concept study">
            <BrandMark className="h-5 w-5" />
            <span
              className="font-display text-[21px] italic leading-none"
              style={{ color: dark ? DARK_INK : palette.accent }}
            >
              Aurfy
            </span>
          </span>
        </div>
        {redacted ? (
          <p className="mt-1.5 text-[9px] leading-snug" style={{ color: ink, opacity: 0.55 }}>
            Send-safe version: merchant logo and generated imagery removed. Written concept only.
          </p>
        ) : null}
      </div>
    );
  };

  const Pattern = () => (
    <ConceptArtwork
      brand={merchantName}
      initials={monogram}
      category={category}
      palette={palette}
    />
  );

  const ImageLayer = () =>
    hasImage ? (
      <img
        src={imageUrl ?? ""}
        alt={imageAlt ?? "AI-generated illustrative concept visual; no real partnership implied."}
        className="h-full w-full object-cover"
        loading="eager"
        decoding="async"
        onError={() => {
          setFailedUrl(imageUrl ?? null);
          onImageError?.();
        }}
      />
    ) : (
      <Pattern />
    );

  const cardStyle = { background: palette.panel, color: palette.ink };

  if (effectiveLayout === "cover") {
    return (
      <article className={cn("relative overflow-hidden rounded-[30px] border border-border/50", className)} style={cardStyle}>
        <div className="relative flex min-h-[540px] flex-col">
          <div className="absolute inset-0">
            <ImageLayer />
          </div>
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ background: "linear-gradient(180deg, rgba(9,9,18,0.5) 0%, rgba(9,9,18,0.05) 38%, rgba(9,9,18,0.88) 100%)" }}
          />
          <div className="relative z-10 flex flex-1 flex-col p-5">
            <Chips onImage={hasImage} />
            <div className="mt-auto pt-10">
              <Lockup />
              <Headline className="mt-4 !text-[30px] sm:!text-[35px]" />
              <p className="mt-2 max-w-[36ch] text-[11.5px] leading-relaxed sm:text-[12px]" style={{ color: palette.ink, opacity: 0.84 }}>
                {subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
              </p>
              <CapabilityRow />
              <SignalLine />
              <Footer />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (effectiveLayout === "poster") {
    return (
      <article className={cn("relative overflow-hidden rounded-[30px] border border-border/50", className)} style={cardStyle}>
        <div className="relative h-56 w-full overflow-hidden">
          <ImageLayer />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ background: "linear-gradient(180deg, rgba(9,9,18,0.42) 0%, rgba(9,9,18,0) 55%)" }}
          />
          <div className="absolute inset-x-3 top-3 z-10">
            <Chips onImage={hasImage} />
          </div>
        </div>

        <div
          className="relative z-10 mx-4 -mt-12 rounded-2xl p-4 shadow-card"
          style={{ background: palette.accent, color: DARK_INK }}
        >
          <Lockup dark />
          <Headline className="mt-3 !text-[26px] sm:!text-[30px]" />
        </div>

        <div className="p-5 pt-3">
          <p className="max-w-[38ch] text-[11.5px] leading-relaxed sm:text-[12px]" style={{ color: palette.ink, opacity: 0.84 }}>
            {subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
          </p>
          <CapabilityRow />
          <SignalLine />
          <Footer />
        </div>
      </article>
    );
  }

  if (effectiveLayout === "split") {
    return (
      <article className={cn("relative overflow-hidden rounded-[30px] border border-border/50", className)} style={cardStyle}>
        <div className="p-5">
          <Chips />
          <div className="mt-4">
            <Lockup />
            <Headline className="mt-4" />
            <p className="mt-2 max-w-[38ch] text-[11.5px] leading-relaxed sm:text-[12px]" style={{ color: palette.ink, opacity: 0.84 }}>
              {subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
            </p>
            <CapabilityRow />
            <SignalLine />
          </div>
        </div>
        <div className="relative h-48 w-full overflow-hidden sm:h-56">
          <ImageLayer />
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: palette.accent }} aria-hidden="true" />
        </div>
        <div className="p-5 pt-3">
          <Footer />
        </div>
      </article>
    );
  }

  if (effectiveLayout === "type") {
    return (
      <article className={cn("relative overflow-hidden rounded-[30px] border border-border/50", className)} style={cardStyle}>
        {!redacted ? (
          <CategoryIcon
            className="pointer-events-none absolute -bottom-10 -right-8 h-48 w-48 opacity-[0.08]"
            style={{ color: palette.ink }}
            aria-hidden="true"
          />
        ) : null}
        <svg
          className="pointer-events-none absolute -left-10 -top-12 h-48 w-48 opacity-[0.16]"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <g stroke={palette.accent} strokeWidth="4" strokeLinecap="round">
            <path d="M30 160a60 60 0 0 1 60-60" />
            <path d="M30 118a102 102 0 0 1 102 102" />
            <path d="M30 76a144 144 0 0 1 144 144" />
          </g>
        </svg>
        <div className="relative p-5">
          <Chips />
          <div className="mt-5">
            <Lockup />
            <Headline className="mt-5 !text-[31px] sm:!text-[35px]" />
            <p className="mt-2.5 max-w-[38ch] text-[12px] leading-relaxed" style={{ color: palette.ink, opacity: 0.84 }}>
              {subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
            </p>
            {!redacted ? <Journey accent={palette.accent} ink={palette.ink} /> : null}
            <CapabilityRow />
            <SignalLine />
            <Footer />
          </div>
        </div>
      </article>
    );
  }

  // Editorial (default)
  return (
    <article className={cn("relative overflow-hidden rounded-[30px] border border-border/50", className)} style={cardStyle}>
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <ImageLayer />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(9,9,18,0.36) 0%, rgba(9,9,18,0) 46%, rgba(9,9,18,0.2) 100%)" }}
        />
        <div className="absolute inset-x-3 top-3">
          <Chips onImage={hasImage} />
        </div>
      </div>
      <div className="p-5">
        <Lockup />
        <Headline className="mt-4" />
        <p className="mt-2 max-w-[38ch] text-[11.5px] leading-relaxed sm:text-[12px]" style={{ color: palette.ink, opacity: 0.84 }}>
          {subhead || "A short line connecting the merchant's observed moment to a grounded Aurfy capability."}
        </p>
        <CapabilityRow />
        {!redacted ? <Journey accent={palette.accent} ink={palette.ink} /> : null}
        <SignalLine />
        <Footer />
      </div>
    </article>
  );
}
