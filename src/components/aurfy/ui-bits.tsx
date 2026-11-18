import { Check, Copy, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/aurfy/utils";
import { toast } from "sonner";

export function Pill({
  children,
  tone = "neutral",
  className,
  icon: Icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "outline";
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-muted/70 text-ink-soft",
    primary: "border-primary/20 bg-primary-soft text-primary",
    accent: "border-accent/50 bg-accent-soft text-accent-foreground",
    success: "border-success/25 bg-success-soft text-success",
    warning: "border-warning/25 bg-warning-soft text-warning",
    danger: "border-destructive/20 bg-destructive/10 text-destructive",
    outline: "border-border bg-transparent text-ink-soft",
  };
  return (
    <span className={cn("aurfy-chip", tones[tone], className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function TruthNote({
  children,
  tone = "info",
  title,
  icon: Icon,
  className,
}: {
  children: ReactNode;
  tone?: "info" | "demo" | "safety";
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const styles = {
    info: "border-border bg-secondary/60 text-secondary-foreground",
    demo: "border-warning/25 bg-warning-soft/70 text-warning",
    safety: "border-primary/15 bg-primary-soft/70 text-secondary-foreground",
  } as const;
  const DefaultIcon = tone === "demo" ? TriangleAlert : tone === "safety" ? ShieldCheck : Info;
  const Chosen = Icon ?? DefaultIcon;
  return (
    <div className={cn("flex gap-3 rounded-2xl border px-4 py-3 text-sm", styles[tone], className)}>
      <Chosen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn("leading-relaxed", title && "mt-1 opacity-90")}>{children}</div>
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <p className="font-mono-label mb-2 text-primary">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ReviewToggle({
  checked,
  onChange,
  title,
  description,
  className,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
        checked ? "border-success/40 bg-success-soft/60" : "border-border bg-card hover:border-primary/40",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition",
          checked ? "border-success bg-success text-success-foreground" : "border-input bg-card",
        )}
      >
        {checked ? <Check className="h-4 w-4" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  disabled,
  variant = "default",
  className,
  onCopied,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "accent";
  className?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const ok = await copyText(text);
    if (!ok) {
      toast.error("Copy failed", { description: "Select the draft text and copy it manually." });
      return;
    }
    setCopied(true);
    onCopied?.();
    toast.success("Copied to clipboard", { description: "Nothing was sent. Paste it into your own email or message." });
    window.setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled || !text.trim()}
      className={cn(
        "tap w-full",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "accent" && "bg-accent text-accent-foreground hover:bg-accent/90",
        variant === "outline" && "border border-input bg-card text-foreground hover:bg-secondary",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono-label text-[10px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-xs font-medium text-foreground">{value}</dd>
    </div>
  );
}
