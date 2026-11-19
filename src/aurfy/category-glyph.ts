import { Coffee, ShoppingBasket, Store, Waves, type LucideIcon } from "lucide-react";

export function categoryGlyph(category?: string): LucideIcon {
  const value = (category ?? "").toLowerCase();
  if (value.includes("coffee") || value.includes("café") || value.includes("cafe")) return Coffee;
  if (value.includes("swim") || value.includes("beach")) return Waves;
  if (value.includes("grocer") || value.includes("market")) return ShoppingBasket;
  return Store;
}
