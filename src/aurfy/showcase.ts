import type { ConceptPaletteId } from "./types";

export type ShowcaseExample = {
  merchantId: string;
  name: string;
  category: string;
  angleLabel: string;
  headline: string;
  subhead: string;
  capability: string;
  palette: ConceptPaletteId;
  image: string;
  imageAlt: string;
  initials: string;
};

/**
 * Curated entry-point examples. They mirror the fictional demo concepts so
 * "Open this concept" continues the same story in the studio. They are not
 * evidence and do not imply any partnership.
 */
export const SHOWCASE_EXAMPLES: ShowcaseExample[] = [
  {
    merchantId: "marlow-fen",
    name: "Marlow & Fen",
    category: "Specialty coffee · 3 cafés + online beans",
    angleLabel: "Connected commerce",
    headline: "One payment layer. Every counter.",
    subhead:
      "A connected payment experience across the app, the café counter and online beans — supported by one Aurfy setup.",
    capability: "Online and in-store payments",
    palette: "clay",
    image: "/examples/marlow-fen.jpg",
    imageAlt:
      "AI-generated illustrative still life of a café table with coffee, a phone and a card terminal; fictional example with no partnership.",
    initials: "MF",
  },
  {
    merchantId: "halcyon-swim",
    name: "Halcyon Swim",
    category: "DTC swimwear · seasonal drops",
    angleLabel: "Customer choice",
    headline: "Pay your way. Everywhere.",
    subhead:
      "One Aurfy checkout across seasonal drops, summer pop-ups and the online store — cards and digital wallets included.",
    capability: "Cards and digital wallets",
    palette: "teal",
    image: "/examples/halcyon-swim.jpg",
    imageAlt:
      "AI-generated illustrative boutique swimwear scene with folded towels and a phone; fictional example with no partnership.",
    initials: "HS",
  },
  {
    merchantId: "fernway-grocers",
    name: "Fernway Grocers",
    category: "Neighbourhood grocer · 2 stores",
    angleLabel: "Simpler integration",
    headline: "One integration. Every checkout.",
    subhead: "A single Aurfy API keeps the app, two stores and weekend markets on one payments setup.",
    capability: "Unified API",
    palette: "citron",
    image: "/examples/fernway-grocers.jpg",
    imageAlt:
      "AI-generated illustrative market counter with produce, a phone and a card terminal; fictional example with no partnership.",
    initials: "FG",
  },
];
