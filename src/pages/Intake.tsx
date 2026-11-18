import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Check, Loader2, Plus, Radar, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { STAGES } from "@/aurfy/content";
import { initials, merchantSourceMeta } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { MerchantSwitcher } from "@/components/aurfy/merchant-switcher";
import { StageBadge } from "@/components/aurfy/stage-badge";
import { Pill, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

type FormState = { name: string; url: string; category: string; notes: string };

const emptyForm: FormState = { name: "", url: "", category: "", notes: "" };

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(value));
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function Intake() {
  const { merchant, state, setActiveMerchant, addMerchant, updateMerchant, deleteMerchant, signals, pipeline } = useStudio();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: merchant.name,
    url: merchant.url,
    category: merchant.category,
    notes: merchant.notes,
  });
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [newForm, setNewForm] = useState<FormState>(emptyForm);
  const [newErrors, setNewErrors] = useState<{ name?: string; url?: string }>({});
  const currentSource = merchantSourceMeta(merchant);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setForm({ name: merchant.name, url: merchant.url, category: merchant.category, notes: merchant.notes });
    setSavedFlash(false);
  }, [merchant.id, merchant.name, merchant.url, merchant.category, merchant.notes]);

  const dirty = useMemo(
    () =>
      form.name !== merchant.name ||
      form.url !== merchant.url ||
      form.category !== merchant.category ||
      form.notes !== merchant.notes,
    [form, merchant],
  );

  const saveExisting = () => {
    const nextErrors: { name?: string; url?: string } = {};
    if (!form.name.trim()) nextErrors.name = "Add the merchant name so the workspace has a subject.";
    if (form.url.trim() && !isValidUrl(form.url)) nextErrors.url = "Enter a valid web address, for example https://merchant.example.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateMerchant({
      name: form.name.trim(),
      url: normalizeUrl(form.url),
      category: form.category.trim(),
      notes: form.notes.trim(),
    });
    setSavedFlash(true);
    toast.success("Merchant record updated", { description: "Saved in this browser only." });
    window.setTimeout(() => setSavedFlash(false), 2400);
  };

  const create = () => {
    const nextErrors: { name?: string; url?: string } = {};
    if (!newForm.name.trim()) nextErrors.name = "A merchant name is required.";
    if (newForm.url.trim() && !isValidUrl(newForm.url)) nextErrors.url = "Enter a valid web address or leave it blank.";
    setNewErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setCreating(true);
    const created = addMerchant({
      name: newForm.name,
      url: normalizeUrl(newForm.url),
      category: newForm.category,
      notes: newForm.notes,
    });
    setNewForm(emptyForm);
    toast.success(`${created.name} added`, {
      description: "A new empty workspace. Load the fictional demo library or paste a public source next.",
    });
    window.setTimeout(() => {
      setCreating(false);
      navigate("/signals");
    }, 250);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        step={1}
        eyebrow="Merchant intake"
        title="Who are we approaching?"
        description="Start with the merchant, not the pitch. These fields stay visible throughout the workflow and can be corrected at any time."
        action={
          <div className="flex items-center gap-2">
            <Pill tone={currentSource.tone}>{currentSource.label}</Pill>
            <MerchantSwitcher compact />
          </div>
        }
      />

      <TruthNote tone="demo" title="This is a prototype dataset">
        Preseeded merchants, URLs and notes are fictional. Editing or adding a record writes only to this browser&apos;s local
        storage — no CRM, enrichment service or account lookup is connected.
      </TruthNote>

      <section className="surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeading eyebrow="Current workspace" title={merchant.name} />
          <span className="text-[11px] text-muted-foreground">
            {signals.length} signal{signals.length === 1 ? "" : "s"} in this workspace
          </span>
        </div>

        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveExisting();
          }}
        >
          <div className="sm:col-span-1">
            <Label htmlFor="merchant-name" className="field-label">
              Merchant name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="merchant-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="aurfy-input"
              placeholder="e.g. Marlow & Fen Coffee Co."
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "merchant-name-error" : undefined}
              autoComplete="organization"
            />
            {errors.name ? (
              <p id="merchant-name-error" className="mt-1.5 text-xs font-medium text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="merchant-url" className="field-label">
              Website
            </Label>
            <Input
              id="merchant-url"
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
              className="aurfy-input"
              placeholder="https://merchant.example"
              inputMode="url"
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "merchant-url-error" : "merchant-url-hint"}
            />
            <p id="merchant-url-hint" className="mt-1.5 text-[11px] text-muted-foreground">
              Stored as a reference only. The app does not crawl or verify this site.
            </p>
            {errors.url ? (
              <p id="merchant-url-error" className="mt-1 text-xs font-medium text-destructive">
                {errors.url}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="merchant-category" className="field-label">
              Category
            </Label>
            <Input
              id="merchant-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="aurfy-input"
              placeholder="e.g. Specialty coffee · 3 cafés + online"
            />
          </div>

          <div>
            <Label htmlFor="merchant-pipeline" className="field-label">
              Pipeline stage
            </Label>
            <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-input bg-muted/40 px-3 py-2">
              <StageBadge stage={pipeline.stage} />
              <button type="button" onClick={() => navigate("/pipeline")} className="ml-auto text-[11px] font-semibold text-primary underline-offset-2 hover:underline">
                Update in pipeline
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="merchant-notes" className="field-label">
              Notes
            </Label>
            <Textarea
              id="merchant-notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="aurfy-input min-h-[104px]"
              placeholder="Context you already know, boundaries, who to speak to, what not to assume…"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Do not paste private contact details or confidential data.</p>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              {dirty ? "Unsaved changes in this form." : savedFlash ? "Saved locally just now." : "All changes saved locally."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="tap min-h-11 px-5" disabled={!dirty}>
                {savedFlash ? <Check className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                {savedFlash ? "Saved" : "Save merchant"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="tap min-h-11 px-5"
                onClick={() => navigate("/signals")}
              >
                Go to signals
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section>
        <SectionHeading
          eyebrow="Prospect records"
          title="All merchants in this workspace"
          description="Switch workspaces without losing any local edits. Deleting a demo merchant only affects this browser."
        />
        <ul className="mt-3 space-y-2">
          {state.merchants.map((item) => {
            const isActive = item.id === merchant.id;
            const stage = state.pipeline[item.id]?.stage;
            const recordStage = STAGES.find((stageItem) => stageItem.id === stage);
            return (
              <li
                key={item.id}
                className={cn(
                  "surface flex flex-wrap items-center gap-3 p-3.5 sm:flex-nowrap",
                  isActive && "border-primary/35 bg-primary-soft/35",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-[11px] font-bold text-secondary-foreground">
                  {initials(item.name) || <Users className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    {isActive ? <Pill tone="primary">Current</Pill> : null}
                    <Pill tone={merchantSourceMeta(item).tone}>{merchantSourceMeta(item).label}</Pill>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {item.category || "No category"} · {recordStage?.label ?? "Research"}
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveMerchant(item.id)}
                    className="tap min-h-9 flex-1 rounded-full border border-input bg-card px-3 text-xs text-foreground hover:bg-secondary sm:flex-none"
                  >
                    {isActive ? "Open" : "Switch"}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={state.merchants.length <= 1}
                        className="tap min-h-9 rounded-full border border-input bg-card px-2.5 text-muted-foreground hover:text-destructive disabled:opacity-40"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes the merchant and all its local signals, brief, concept, draft and pipeline history from this
                          browser. It cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep record</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteMerchant(item.id);
                            toast.success(`${item.name} removed from this browser`);
                          }}
                        >
                          Delete record
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="surface p-4 sm:p-6">
        <SectionHeading
          eyebrow="New workspace"
          title="Add a merchant"
          description="New records start empty: no fabricated signals, brief or concept are attached. You can load the labeled demo library or paste a public source in the next step."
        />
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create();
          }}
        >
          <div>
            <Label htmlFor="new-name" className="field-label">
              Merchant name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-name"
              value={newForm.name}
              onChange={(event) => setNewForm({ ...newForm, name: event.target.value })}
              className="aurfy-input"
              placeholder="New merchant"
              aria-invalid={Boolean(newErrors.name)}
            />
            {newErrors.name ? <p className="mt-1.5 text-xs font-medium text-destructive">{newErrors.name}</p> : null}
          </div>
          <div>
            <Label htmlFor="new-url" className="field-label">
              Website
            </Label>
            <Input
              id="new-url"
              value={newForm.url}
              onChange={(event) => setNewForm({ ...newForm, url: event.target.value })}
              className="aurfy-input"
              placeholder="https://merchant.example"
              inputMode="url"
              aria-invalid={Boolean(newErrors.url)}
            />
            {newErrors.url ? <p className="mt-1.5 text-xs font-medium text-destructive">{newErrors.url}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="new-category" className="field-label">
              Category
            </Label>
            <Input
              id="new-category"
              value={newForm.category}
              onChange={(event) => setNewForm({ ...newForm, category: event.target.value })}
              className="aurfy-input"
              placeholder="e.g. DTC skincare · online + pop-ups"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="new-notes" className="field-label">
              Notes
            </Label>
            <Textarea
              id="new-notes"
              value={newForm.notes}
              onChange={(event) => setNewForm({ ...newForm, notes: event.target.value })}
              className="aurfy-input min-h-[88px]"
              placeholder="What do you already know? What must you not assume?"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="tap min-h-11 w-full sm:w-auto sm:px-5" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "Creating workspace…" : "Create merchant workspace"}
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A new record is labeled <span className="font-semibold">Manual record</span>; the preseeded ones remain{" "}
              <span className="font-semibold">Demo</span>.
            </p>
          </div>
        </form>
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-[11px] text-muted-foreground">
        <Radar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        Next: choose signals — aim for one customer-behaviour and one peer/competitor item before drafting.
      </div>
    </div>
  );
}
