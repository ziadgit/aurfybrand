import { useId } from "react";
import { CONCEPT_PALETTES } from "@/aurfy/content";
import { categoryGlyph } from "@/aurfy/category-glyph";
import { cn } from "@/lib/utils";

type Palette = (typeof CONCEPT_PALETTES)[number];

const fade = (color: string, alpha: number) => color.replace(/^hsl\((.+)\)$/, `hsl($1 / ${alpha})`);

/**
 * The fallback "image" for a card without generated artwork: a deterministic
 * brand study built from the palette, the category and the brand monogram.
 * Purely decorative and illustrative, never a real photo or a logo.
 */
export function ConceptArtwork({
  brand,
  initials,
  category,
  palette,
}: {
  brand: string;
  initials: string;
  category?: string;
  palette: Palette;
}) {
  const grainId = `grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const seed = brand.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const flip = seed % 2 === 1;
  const tilt = (seed % 21) - 10;
  const Glyph = categoryGlyph(category);
  const monogram = (initials || brand.slice(0, 2)).toUpperCase();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: palette.panel }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 62% at ${flip ? 26 : 74}% 14%, ${fade(palette.accent, 0.34)} 0%, transparent 62%), radial-gradient(58% 52% at ${flip ? 84 : 16}% 98%, ${fade(palette.accent, 0.2)} 0%, transparent 58%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(${fade(palette.ink, 0.5)} 1px, transparent 1px), linear-gradient(90deg, ${fade(palette.ink, 0.5)} 1px, transparent 1px)`,
          backgroundSize: "38px 38px",
          WebkitMaskImage: "radial-gradient(125% 105% at 50% 26%, #000 8%, transparent 74%)",
          maskImage: "radial-gradient(125% 105% at 50% 26%, #000 8%, transparent 74%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(${fade(palette.ink, 0.55)} 0.7px, transparent 1px)`,
          backgroundSize: "11px 11px",
          WebkitMaskImage: "linear-gradient(205deg, transparent 18%, #000 58%, transparent 96%)",
          maskImage: "linear-gradient(205deg, transparent 18%, #000 58%, transparent 96%)",
        }}
      />

      <svg
        viewBox="0 0 400 400"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        className="absolute h-[112%] w-[112%]"
        style={{
          right: flip ? "auto" : "-18%",
          left: flip ? "-20%" : "auto",
          top: "-16%",
          transform: `rotate(${tilt}deg)`,
        }}
      >
        <g stroke={palette.accent} strokeOpacity="0.5">
          <circle cx="200" cy="200" r="150" strokeWidth="0.8" strokeDasharray="1 6" />
          <circle cx="200" cy="200" r="114" strokeWidth="1.1" />
          <circle cx="200" cy="200" r="78" strokeWidth="0.8" strokeDasharray="24 6" strokeOpacity="0.4" />
          <path d="M200 30v26M200 344v26M30 200h26M344 200h26" strokeOpacity="0.35" />
        </g>
        <circle cx="200" cy="86" r="3.4" fill={palette.accent} fillOpacity="0.95" />
        <circle cx="314" cy="200" r="1.8" fill={palette.ink} fillOpacity="0.75" />
        <circle cx="118" cy="282" r="1.4" fill={palette.ink} fillOpacity="0.5" />
      </svg>

      <Glyph
        className="absolute"
        strokeWidth={0.8}
        style={{
          width: "54%",
          height: "54%",
          left: flip ? "auto" : "-8%",
          right: flip ? "-8%" : "auto",
          bottom: "-13%",
          color: palette.ink,
          opacity: 0.09,
        }}
      />

      <span
        className="absolute select-none font-display italic leading-[0.7]"
        style={{
          right: flip ? "auto" : "-2%",
          left: flip ? "-3%" : "auto",
          bottom: "-10%",
          fontSize: "9rem",
          color: palette.ink,
          opacity: 0.07,
        }}
      >
        {monogram}
      </span>

      <div
        className="absolute inset-3 rounded-[22px]"
        style={{ border: `1px solid ${fade(palette.ink, 0.15)}` }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-[0.16] mix-blend-overlay">
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} opacity="0.55" />
      </svg>
    </div>
  );
}

/**
 * The merchant mark on a card. Real, publicly hosted logos sit on a pressed
 * paper crest; brands without a logo get a designed monogram instead of a
 * bare initials tile. Nothing here fabricates an official logo.
 */
export function BrandCrest({
  name,
  initials,
  logoUrl,
  accent,
  showLogo = true,
  size = "md",
}: {
  name: string;
  initials: string;
  logoUrl?: string | null;
  accent: string;
  showLogo?: boolean;
  size?: "sm" | "md";
}) {
  const monogram = (initials || name.slice(0, 2)).toUpperCase();

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        size === "sm" ? "h-10 w-10" : "h-12 w-12",
      )}
      style={{
        background: "linear-gradient(155deg, hsl(45 48% 99%), hsl(38 30% 90%))",
        boxShadow: `inset 0 0 0 1px hsl(234 30% 14% / 0.16), inset 0 -9px 16px hsl(28 42% 22% / 0.1), 0 10px 22px -12px hsl(240 45% 8% / 0.75)`,
      }}
    >
      <span
        className="absolute inset-[3px] rounded-[13px]"
        style={{ border: `1px solid ${fade(accent, 0.42)}` }}
        aria-hidden="true"
      />
      <span
        className="absolute -right-4 -top-4 h-7 w-7 rotate-45"
        style={{ background: fade(accent, 0.3) }}
        aria-hidden="true"
      />
      <span
        className="font-display text-[17px] leading-none tracking-tight"
        style={{ color: "hsl(234 30% 14%)" }}
        aria-hidden="true"
      >
        {monogram}
      </span>
      {showLogo && logoUrl ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="absolute inset-0 h-full w-full object-contain p-1.5"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}
