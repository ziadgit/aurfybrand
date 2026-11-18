import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9 shrink-0", className)}
      role="img"
      aria-label="Aurfy"
      focusable="false"
    >
      <defs>
        <linearGradient id="aurfy-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(252 60% 22%)" />
          <stop offset="0.6" stopColor="hsl(252 62% 42%)" />
          <stop offset="1" stopColor="hsl(268 70% 56%)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#aurfy-mark)" />
      <circle cx="22" cy="44" r="3.2" fill="hsl(73 84% 62%)" />
      <path
        d="M22 33.5A10.5 10.5 0 0 1 32.5 44"
        fill="none"
        stroke="hsl(73 84% 62%)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M22 25.5A18.5 18.5 0 0 1 40.5 44"
        fill="none"
        stroke="hsl(73 84% 62%)"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M22 17.5A26.5 26.5 0 0 1 48.5 44"
        fill="none"
        stroke="hsl(73 84% 62%)"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  );
}

export function BrandLockup({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark className={compact ? "h-8 w-8" : "h-9 w-9"} />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[17px] font-bold tracking-tight", inverted ? "text-primary-foreground" : "text-foreground")}>Aurfy</span>
        <span className={cn("font-mono-label mt-1 text-[9px]", inverted ? "text-primary-foreground/60" : "text-muted-foreground")}>
          Signal Studio
        </span>
      </span>
    </span>
  );
}
