import { CONCEPT_FONTS, CONCEPT_PALETTES } from "./content";
import { PROSPECTS, type Prospect } from "./prospects";
import type { AngleId, ConceptFontId, ConceptPaletteId, Merchant, Signal, WorkspaceState } from "./types";
import { initials } from "./utils";

export type FeedSource = "demo" | "public" | "clay";
export type FeedSignal = Omit<Signal, "id" | "status" | "addedAt">;

export type FeedItem = {
  id: string;
  brand: string;
  brandKey: string;
  merchantId?: string;
  prospect?: Prospect;
  category: string;
  source: FeedSource;
  sourceLabel: string;
  signal: FeedSignal;
  palette: ConceptPaletteId;
  fontId: ConceptFontId;
  logoUrl: string | null;
  initials: string;
  angle: AngleId;
  categoryLabel: string;
};

export function suggestAngle(signal: Pick<FeedSignal, "title" | "whyItMatters">): AngleId {
  const text = `${signal.title} ${signal.whyItMatters}`.toLowerCase();
  if (/wholesale|integration|\bapi\b|consolidat|stack|tooling/.test(text)) return "simpler";
  if (/choice|wallet|payment method|split|gift|digital/.test(text)) return "choice";
  return "connected";
}

const sourceLabel = (source: FeedSource) =>
  source === "demo" ? "Fictional demo" : source === "public" ? "Public snapshot" : "Simulated Clay";

function demoItems(state: WorkspaceState): FeedItem[] {
  return state.merchants
    .filter((merchant) => merchant.isDemo)
    .flatMap((merchant) => {
      const signals = (state.signalsByMerchant[merchant.id] ?? []).filter((signal) => signal.status !== "rejected");
      const preferred = signals.filter((signal) => signal.status === "selected" || signal.status === "saved");
      const chosen = preferred.length > 0 ? preferred : signals;
      const concept = state.concepts[merchant.id];
      const name = concept?.merchantDisplayName || merchant.name;
      return chosen.map((signal) => ({
        id: `demo_${merchant.id}_${signal.id}`,
        brand: name,
        brandKey: merchant.id,
        merchantId: merchant.id,
        category: merchant.category,
        source: "demo" as const,
        sourceLabel: sourceLabel("demo"),
        signal,
        palette: concept?.palette ?? "clay",
        fontId: concept?.displayFont ?? "bodoni",
        logoUrl: concept?.logoDataUrl ?? null,
        initials: initials(name),
        angle: suggestAngle(signal),
        categoryLabel: signal.category === "customer" ? "Customer lens" : "Peer lens",
      }));
    });
}

function prospectItems(source: "public" | "clay"): FeedItem[] {
  const prospects = PROSPECTS.filter((prospect) => prospect.source === (source === "public" ? "public" : "clay_simulated"));
  const offset = source === "public" ? 0 : 2;
  return prospects.flatMap((prospect) =>
    prospect.signals.map((signal, index) => {
      const palette = CONCEPT_PALETTES[(offset + index) % CONCEPT_PALETTES.length].id;
      const fontId = CONCEPT_FONTS[(offset + index + 1) % CONCEPT_FONTS.length].id;
      return {
        id: `${source}_${prospect.key}_${index}`,
        brand: prospect.name,
        brandKey: prospect.key,
        prospect,
        category: prospect.category,
        source,
        sourceLabel: sourceLabel(source),
        signal,
        palette,
        fontId,
        logoUrl: null,
        initials: initials(prospect.name),
        angle: suggestAngle(signal),
        categoryLabel: signal.category === "customer" ? "Customer lens" : "Peer lens",
      };
    }),
  );
}

export function buildFeed(state: WorkspaceState): FeedItem[] {
  const groups = [prospectItems("public"), demoItems(state), prospectItems("clay")];
  const mixed: FeedItem[] = [];
  const max = Math.max(...groups.map((group) => group.length));
  for (let index = 0; index < max; index += 1) {
    for (const group of groups) {
      if (group[index]) mixed.push(group[index]);
    }
  }
  return mixed;
}

export function findFeedMerchant(state: WorkspaceState, item: FeedItem): Merchant | undefined {
  if (item.merchantId) return state.merchants.find((merchant) => merchant.id === item.merchantId);
  if (!item.prospect) return undefined;
  const normalize = (value: string) => value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return state.merchants.find(
    (merchant) =>
      (merchant.url && normalize(merchant.url) === normalize(item.prospect?.url ?? "")) ||
      merchant.name.trim().toLowerCase() === item.brand.trim().toLowerCase(),
  );
}
