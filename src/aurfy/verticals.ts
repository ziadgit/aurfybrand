import type { AngleId } from "./types";

export type VerticalId = "retail" | "travel" | "marketplace" | "fintech" | "ai" | "saas";

/** The vertical in front of the "·" in a category line, e.g. "Fintech". */
export function verticalOf(category: string) {
  return category.split("·")[0].trim() || category;
}

export function verticalId(category: string): VerticalId {
  const value = (category ?? "").toLowerCase();
  if (/travel|trip|tour|airline|hotel|booking/.test(value)) return "travel";
  if (/fintech|bank|payout|treasury/.test(value)) return "fintech";
  if (/marketplace|ecommerce|e-commerce/.test(value)) return "marketplace";
  if (/\bai\b|search|answer engine|machine learning/.test(value)) return "ai";
  if (/saas|software|platform|api/.test(value)) return "saas";
  return "retail";
}

/** One line for a generated card, phrased for the merchant's business model. */
export function verticalSubhead(category: string) {
  switch (verticalId(category)) {
    case "travel":
      return "Bookings, deposits and balances on one payment layer.";
    case "marketplace":
      return "Checkout, seller splits and payouts in one place.";
    case "fintech":
      return "Subscriptions, card spend and statements that reconcile.";
    case "ai":
      return "Seats, usage and invoices that add up cleanly.";
    case "saas":
      return "Contracts, seats and invoices in one billing relationship.";
    default:
      return "Online and in-store payments across app, counter and online.";
  }
}

/** Angle headlines phrased for the vertical, not just retail counters. */
export function verticalHeadline(category: string, angle: AngleId): string {
  const connected: Record<VerticalId, string> = {
    retail: "One payment layer. Every counter.",
    travel: "Every trip. One payment layer.",
    marketplace: "Every seller. One payment layer.",
    fintech: "Every account. One payment layer.",
    ai: "Every seat. One payment layer.",
    saas: "Every contract. One payment layer.",
  };
  const choice: Record<VerticalId, string> = {
    retail: "Pay your way. Everywhere.",
    travel: "Pay the way you travel.",
    marketplace: "Pay your way. Every order.",
    fintech: "Pay your way. Everywhere.",
    ai: "Pay your way. Every plan.",
    saas: "Pay your way. Every renewal.",
  };
  const simpler: Record<VerticalId, string> = {
    retail: "One integration. Every checkout.",
    travel: "One integration. Every booking.",
    marketplace: "One integration. Every checkout.",
    fintech: "One integration. Every transaction.",
    ai: "One integration. Every invoice.",
    saas: "One integration. Every invoice.",
  };
  const vertical = verticalId(category);
  return angle === "simpler" ? simpler[vertical] : angle === "choice" ? choice[vertical] : connected[vertical];
}
