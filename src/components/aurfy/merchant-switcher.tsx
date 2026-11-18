import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { STAGES } from "@/aurfy/content";
import { initials, merchantSourceMeta } from "@/aurfy/utils";
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
import { Pill } from "./ui-bits";

export function MerchantSwitcher({ compact = false }: { compact?: boolean }) {
  const { state, merchant, setActiveMerchant, pipeline } = useStudio();
  const navigate = useNavigate();
  const stage = STAGES.find((item) => item.id === pipeline.stage);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-left shadow-sm transition hover:border-primary/40",
            compact ? "max-w-[9.5rem]" : "w-full p-2.5",
          )}
          aria-label={`Current merchant ${merchant.name}. Switch merchant`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {initials(merchant.name) || <Users className="h-4 w-4" />}
          </span>
          {compact ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-foreground">{merchant.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{stage?.label ?? "Research"}</span>
            </span>
          )}
          {!compact ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch merchant</DialogTitle>
          <DialogDescription>
            Each merchant keeps its own signals, brief, concept, draft and pipeline record on this device.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {state.merchants.map((item) => {
            const itemStage = STAGES.find((stageItem) => stageItem.id === state.pipeline[item.id]?.stage);
            const isActive = item.id === merchant.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMerchant(item.id);
                    setOpen(false);
                    navigate("/more");
                    toast.success(`Now working on ${item.name}`);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                    isActive ? "border-primary/40 bg-primary-soft/60" : "border-border bg-card hover:border-primary/30",
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground">
                    {initials(item.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground">{item.name}</span>
                      {isActive ? <Check className="h-4 w-4 shrink-0 text-primary" aria-label="Current merchant" /> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.category || "No category"}</span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      <Pill tone={merchantSourceMeta(item).tone}>{merchantSourceMeta(item).label}</Pill>
                      <Pill tone="neutral">{itemStage?.label ?? "Research"}</Pill>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Demo merchants and their signals are fictional. Records added from the prospect engine are labeled Public snapshot or Clay
          simulation. Manual merchants start empty — load the fictional demo library or paste a public source to work with.
        </div>

        <Button asChild className="w-full">
          <Link to="/intake" onClick={() => setOpen(false)}>
            <Plus className="h-4 w-4" />
            Add a merchant
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
