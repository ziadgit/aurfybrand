import type { ReactNode } from "react";

export function PageHeader({
  step,
  eyebrow,
  title,
  description,
  action,
}: {
  step?: number;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 sm:mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-label mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-primary">
            {step ? <span>Step {String(step).padStart(2, "0")} / 07</span> : null}
            {step && eyebrow ? <span className="text-border">—</span> : null}
            {eyebrow ? <span className="text-muted-foreground">{eyebrow}</span> : null}
          </p>
          <h1 className="font-display text-[32px] leading-[1.05] tracking-tight text-foreground sm:text-[40px]">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
          ) : null}
        </div>
        {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
      </div>
    </header>
  );
}
