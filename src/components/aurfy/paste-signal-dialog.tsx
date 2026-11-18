import { useState } from "react";
import { ClipboardPaste, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import type { SignalCategory } from "@/aurfy/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TruthNote } from "./ui-bits";

type FormState = {
  category: SignalCategory;
  title: string;
  sourceName: string;
  sourceUrl: string;
  sourceDate: string;
  text: string;
};

const empty: FormState = {
  category: "customer",
  title: "",
  sourceName: "",
  sourceUrl: "",
  sourceDate: "",
  text: "",
};

export function PasteSignalDialog({ triggerClassName }: { triggerClassName?: string }) {
  const { addPastedSignal } = useStudio();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.text.trim() || form.text.trim().length < 20) {
      nextErrors.text = "Paste at least a couple of sentences (20 characters) so the evidence is meaningful.";
    }
    if (!form.title.trim()) nextErrors.title = "Give the observation a short title.";
    if (form.sourceUrl.trim() && !/^https?:\/\/\S+\.\S+/i.test(form.sourceUrl.trim())) {
      nextErrors.sourceUrl = "Use a full public URL beginning http:// or https://.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addPastedSignal({
      category: form.category,
      title: form.title,
      sourceName: form.sourceName,
      sourceUrl: form.sourceUrl,
      sourceDate: form.sourceDate,
      text: form.text,
    });
    setForm(empty);
    setErrors({});
    setOpen(false);
    toast.success("Signal added as user-supplied", {
      description: "Text was not fetched or verified. It is marked low confidence and clearly labeled.",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        <Button className={cn("tap min-h-11 px-4", triggerClassName)}>
          <ClipboardPaste className="h-4 w-4" />
          Paste a source
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Paste a public article or post</DialogTitle>
          <DialogDescription>
            Add the text and URL you already have. Aurfy labels it as user-supplied and does not fetch, verify or score the page.
          </DialogDescription>
        </DialogHeader>

        <TruthNote tone="info">
          Nothing is opened or crawled. No engagement, reach or trend figures are inferred. For the demo, this is the only way to
          add a signal you did not get from the fictional library.
        </TruthNote>

        <form
          className="mt-1 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <fieldset>
            <legend className="field-label">Signal lens</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "customer", label: "Customer behaviour", hint: "What shoppers do, ask or struggle with" },
                  { id: "peer", label: "Peer / competitor", hint: "What comparable brands say or do" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={form.category === option.id}
                  onClick={() => setForm({ ...form, category: option.id })}
                  className={cn(
                    "min-h-[68px] rounded-2xl border p-3 text-left transition",
                    form.category === option.id
                      ? "border-primary/50 bg-primary-soft/60 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/30",
                  )}
                >
                  <span className="block text-[12.5px] font-semibold text-foreground">{option.label}</span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <Label htmlFor="paste-title" className="field-label">
              Short title
            </Label>
            <Input
              id="paste-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="aurfy-input"
              placeholder="e.g. Checkout notes mention wallet confusion"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title ? <p className="mt-1.5 text-xs text-destructive">{errors.title}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="paste-source" className="field-label">
                Source name
              </Label>
              <Input
                id="paste-source"
                value={form.sourceName}
                onChange={(event) => setForm({ ...form, sourceName: event.target.value })}
                className="aurfy-input"
                placeholder="e.g. Public LinkedIn post (pasted)"
              />
            </div>
            <div>
              <Label htmlFor="paste-date" className="field-label">
                Publication date
              </Label>
              <Input
                id="paste-date"
                type="date"
                value={form.sourceDate}
                onChange={(event) => setForm({ ...form, sourceDate: event.target.value })}
                className="aurfy-input"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paste-url" className="field-label">
              Public URL
            </Label>
            <Input
              id="paste-url"
              value={form.sourceUrl}
              onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })}
              className="aurfy-input"
              placeholder="https://…"
              inputMode="url"
              aria-invalid={Boolean(errors.sourceUrl)}
            />
            {errors.sourceUrl ? <p className="mt-1.5 text-xs text-destructive">{errors.sourceUrl}</p> : null}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="paste-text" className="field-label mb-0">
                Pasted text
              </Label>
              <span className="text-[10px] text-muted-foreground">{form.text.length} / 4000</span>
            </div>
            <Textarea
              id="paste-text"
              value={form.text}
              onChange={(event) => setForm({ ...form, text: event.target.value.slice(0, 4000) })}
              className="aurfy-input mt-2 min-h-[132px]"
              placeholder="Paste the relevant excerpt. Keep it factual; do not add a claim that is not in the source."
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? "paste-text-error" : "paste-text-hint"}
            />
            <p id="paste-text-hint" className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Add nothing invented. The card will say “user-supplied, not independently verified” and will not show a retrieval date.
            </p>
            {errors.text ? (
              <p id="paste-text-error" className="mt-1.5 text-xs text-destructive">
                {errors.text}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" className="tap min-h-11" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="tap min-h-11">
              <Loader2 className={cn("h-4 w-4", "hidden")} />
              Add unverified signal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
