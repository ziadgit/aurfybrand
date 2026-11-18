import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, Layers, Pencil, RotateCcw, ShieldCheck, Sparkles, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { ANGLES, DEFAULT_CAPABILITIES } from "@/aurfy/content";
import type { Capability } from "@/aurfy/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/aurfy/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill, ReviewToggle, SectionHeading, TruthNote } from "@/components/aurfy/ui-bits";

export default function Positioning() {
  const { merchant, selectedSignals, positioning, setAngle, toggleCapability, updateCapability, setPositioningReviewed } = useStudio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const angle = ANGLES.find((item) => item.id === positioning.angle);
  const chosenCapabilities = positioning.capabilities.filter((capability) => positioning.capabilityIds.includes(capability.id));

  const startEdit = (capability: Capability) => {
    setEditingId(capability.id);
    setDraft(capability.statement);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        step={4}
        eyebrow="Positioning"
        title="One angle. Approved words only."
        description="Pick one of three fixed positioning angles, then choose up to two capability statements grounded in the challenge brief. Refine wording, but do not add promises."
        action={<Pill tone={positioning.reviewed ? "success" : "warning"}>{positioning.reviewed ? "Reviewed" : "Needs review"}</Pill>}
      />

      <TruthNote tone="demo" title="What Aurfy may claim here">
        The three capability statements are limited to the challenge brief: online and in-store payments, cards and digital wallets,
        and a unified API. No rates, coverage, certifications, client names or partnership claims are available to this prototype.
      </TruthNote>

      <section aria-labelledby="angles-heading">
        <SectionHeading
          eyebrow="Step 4a"
          title="Choose one positioning angle"
          description="Three fixed lenses. The choice shapes the concept headline and the draft skeleton, not the underlying evidence."
        />
        <div className="mt-3 grid gap-2.5" role="radiogroup" aria-labelledby="angles-heading">
          {ANGLES.map((item, index) => {
            const active = positioning.angle === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setAngle(item.id)}
                className={cn(
                  "surface relative flex w-full items-start gap-3 p-4 text-left transition",
                  active ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
                  )}
                  aria-hidden="true"
                >
                  {active ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono text-[10px] text-muted-foreground">{index + 1}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-foreground">{item.label}</span>
                    {active ? <Pill tone="primary">Selected</Pill> : null}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-soft">{item.short}</span>
                  <span className="mt-1.5 block rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-ink-soft">Use when: </span>
                    {item.rationale}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="capabilities-heading">
        <SectionHeading
          eyebrow="Step 4b"
          title="Choose approved capabilities"
          description="Select up to two. Selecting more than two keeps the first two, so the concept and note stay focused."
        />

        <div className="mt-3 space-y-2.5">
          {positioning.capabilities.map((capability) => {
            const selected = positioning.capabilityIds.includes(capability.id);
            const isEditing = editingId === capability.id;
            const original = DEFAULT_CAPABILITIES.find((item) => item.id === capability.id)?.statement;

            return (
              <div
                key={capability.id}
                className={cn(
                  "surface p-4 transition",
                  selected ? "border-primary/40 bg-primary-soft/25" : "",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    aria-label={`Use capability: ${capability.label}`}
                    onClick={() => toggleCapability(capability.id)}
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
                    )}
                  >
                    {selected ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[14px] font-semibold text-foreground">{capability.label}</h3>
                      {selected ? <Pill tone="primary">In use</Pill> : null}
                      {capability.edited ? <Pill tone="warning">Edited by you</Pill> : <Pill tone="outline">Approved wording</Pill>}
                    </div>

                    {isEditing ? (
                      <div className="mt-2">
                        <Label htmlFor={`capability-${capability.id}`} className="sr-only">
                          Edit {capability.label} wording
                        </Label>
                        <Textarea
                          id={`capability-${capability.id}`}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          className="aurfy-input min-h-[96px] text-[13px]"
                          maxLength={320}
                        />
                        <p className="mt-1.5 text-[10.5px] leading-relaxed text-warning">
                          Keep it to online and in-store payments, cards and digital wallets, or the unified API. Do not add coverage,
                          rates or client claims.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="min-h-10"
                            disabled={!draft.trim() || draft.trim().length < 12}
                            onClick={() => {
                              updateCapability(capability.id, draft.trim());
                              setEditingId(null);
                              toast.success("Capability wording updated", { description: "The positioning review flag was cleared." });
                            }}
                          >
                            <Check className="h-4 w-4" />
                            Save wording
                          </Button>
                          <Button type="button" size="sm" variant="outline" className="min-h-10" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                          {capability.edited && original ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="min-h-10"
                              onClick={() => {
                                updateCapability(capability.id, original);
                                setEditingId(null);
                                toast.success("Approved wording restored");
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{capability.statement}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(capability)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-input bg-card px-3 text-[11px] font-semibold text-foreground hover:bg-secondary"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit wording
                          </button>
                          <span className="text-[10px] text-muted-foreground">
                            {selected ? "Used in concept and draft." : "Not selected."}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <TruthNote tone="info" title="No new capability appears here" icon={ShieldCheck}>
        If a merchant question needs a feature outside these statements, mark it as an unknown in the brief or ask your Aurfy contact.
        The studio will not infer support for it, and the draft will not promise it.
      </TruthNote>

      <section className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeading eyebrow="Review gate" title="Human sign-off" description="The concept and outreach screens use these revisions only after review." />
          <Pill tone={positioning.reviewed ? "success" : "warning"}>{positioning.reviewed ? "Signed off" : "Pending"}</Pill>
        </div>
        <div className="mt-4">
          <ReviewToggle
            checked={positioning.reviewed}
            onChange={(value) => {
              setPositioningReviewed(value);
              if (value) toast.success("Positioning reviewed", { description: "The angle and wording are ready for the concept step." });
            }}
            title="I reviewed the angle and every capability word"
            description="No rate, guarantee, coverage or client outcome has been added. Changes after this point clear the sign-off."
          />
        </div>
      </section>

      <section className="aurfy-ink-card aurfy-grain relative overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono-label text-[9px] text-primary-foreground/60">Current positioning</p>
            <p className="mt-1 text-lg font-semibold">{angle?.label ?? "No angle chosen"}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-primary-foreground/75">
              {angle?.lead ?? "Choose one of the three fixed angles above."}
            </p>
            <ul className="mt-2 space-y-1">
              {chosenCapabilities.length > 0 ? (
                chosenCapabilities.map((capability) => (
                  <li key={capability.id} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-primary-foreground/85">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                    {capability.label}
                    {capability.edited ? <span className="text-primary-foreground/50">(edited)</span> : null}
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-1.5 text-[11px] text-primary-foreground/70">
                  <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  No capability selected yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          {selectedSignals.length} selected signals still support this positioning.
        </p>
        <Button asChild className="tap min-h-11" disabled={!positioning.angle || positioning.capabilityIds.length === 0}>
          <Link to="/concept" aria-disabled={!positioning.angle || positioning.capabilityIds.length === 0}>
            Next: build the concept
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      {!positioning.reviewed ? (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-warning">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          You can continue while review is pending; the concept and draft will show a review warning.
        </p>
      ) : null}
      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Positioning is stored per merchant on this device.
      </p>
      <p className="sr-only">{merchant.name} positioning</p>
    </div>
  );
}
