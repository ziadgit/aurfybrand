import { verticalId } from "@/aurfy/verticals";
import {
  Cloud,
  Coffee,
  CreditCard,
  Plane,
  Search,
  ShoppingBag,
  ShoppingBasket,
  Store,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** A small category glyph for card artwork. Ordered so multi-word verticals win. */
export function categoryGlyph(category?: string): LucideIcon {
  const value = (category ?? "").toLowerCase();
  if (/coffee|café|cafe/.test(value)) return Coffee;
  if (/swim|beach/.test(value)) return Waves;
  if (/grocer|market|bakery|food|chocolate/.test(value)) return ShoppingBasket;
  switch (verticalId(category ?? "")) {
    case "travel":
      return Plane;
    case "fintech":
      return CreditCard;
    case "marketplace":
      return ShoppingBag;
    case "ai":
      return Search;
    case "saas":
      return Cloud;
    default:
      return Store;
  }
}
