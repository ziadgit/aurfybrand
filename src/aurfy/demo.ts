import { DEFAULT_CAPABILITIES } from "./content";
import type {
  Brief,
  ConceptDraft,
  Merchant,
  OutreachDraft,
  PipelineEntry,
  Positioning,
  Signal,
  SignalStatus,
  WorkspaceState,
} from "./types";

const now = () => new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const daysAhead = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const DEMO_LIBRARY_NOTE =
  "Fictional demo library. No real articles, brands, people, dates or engagement figures exist behind these cards.";

type SeedFields = Omit<Signal, "id" | "status" | "addedAt"> & { key: string };

const DEMO_SOURCE = (n: number, detail: string) => ({
  sourceName: `Demo source ${String(n).padStart(2, "0")} — fictional ${detail}`,
  sourceUrl: `https://demo.aurfy.example/signal/${String(n).padStart(2, "0")}`,
});

const seedSignals: SeedFields[] = [
  {
    key: "01",
    category: "customer",
    title: "Guests ask to split a counter bill between two phones",
    ...DEMO_SOURCE(1, "checkout-feedback summary"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: in three invented feedback excerpts, café guests ask staff whether a bill can be split across two phones at the counter. The excerpts were written for this prototype and describe an invented café.",
    whyItMatters:
      "Inference: split-payment requests may signal that the counter flow assumes one payer, which can slow the queue and make staff improvise. Not confirmed for any real merchant.",
    novelty:
      "Demo novelty: the interesting part is not splitting itself, but that the request appears at the counter rather than in the app. Treat as a testable angle.",
    limitations:
      "Completely fabricated. No interviews, reviews or figures support this card. Confidence is set low because it is a demo hypothesis only.",
    confidence: "low",
    question:
      "When two guests want to split a counter order today, what happens at the terminal — and how often?",
    tags: ["counter", "split payment", "service speed"],
  },
  {
    key: "02",
    category: "customer",
    title: "Demo support notes repeat a card-retry moment at pickup",
    ...DEMO_SOURCE(2, "support-note exercise"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented support-note exercise lists card retries immediately before pickup as a recurring theme, with staff re-running the payment at the counter.",
    whyItMatters:
      "Inference: a retry at the handoff point could be experienced as a failed order even when the sale completes, which may weaken trust in mobile ordering. Unverified.",
    novelty:
      "Demo novelty: the note locates friction at pickup, not at checkout — a useful distinction for a merchant conversation.",
    limitations:
      "Fabricated support notes. No retry rate, order count or customer comment is real.",
    confidence: "low",
    question:
      "Where in the pickup handoff do staff most often need to re-run a payment?",
    tags: ["pickup", "payment retry", "support"],
  },
  {
    key: "03",
    category: "customer",
    title: "A saved card in the app is not offered at the counter",
    ...DEMO_SOURCE(3, "journey-map workshop"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: a prototype journey map shows a guest saving a card in the merchant app, then being asked to present a different card in store because the two setups are described as separate.",
    whyItMatters:
      "Inference: the guest may expect the app and the café to recognise the same payment relationship. That expectation gap is a connected-commerce talking point, not a proven pain.",
    novelty:
      "Demo novelty: the signal is about continuity between channels rather than the payment method itself.",
    limitations:
      "Fabricated workshop artefact. The workflow, storage of the card and merchant setup are assumptions in the demo.",
    confidence: "medium",
    question:
      "If a guest saves a card in the app, what should happen when they order at the counter?",
    tags: ["saved card", "omnichannel", "expectation"],
  },
  {
    key: "04",
    category: "customer",
    title: "Gift-card balance questions keep returning to the counter",
    ...DEMO_SOURCE(4, "FAQ draft review"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented FAQ draft includes three separate entries about checking a gift-card balance online versus in store, written as if guests had asked repeatedly.",
    whyItMatters:
      "Inference: if balances live in two places, guests may not trust the gift card across channels. This may matter for retention, but the volume is unknown.",
    novelty:
      "Demo novelty: it is a low-drama operational signal that could open a practical conversation about joined-up payments.",
    limitations:
      "Fabricated FAQ text. No real gift-card programme, balance data or enquiry volume exists.",
    confidence: "low",
    question:
      "Can a guest check and spend a gift-card balance the same way online and in store?",
    tags: ["gift card", "balance", "channels"],
  },
  {
    key: "05",
    category: "customer",
    title: "Refund status becomes the top demo support theme after a peak",
    ...DEMO_SOURCE(5, "peak-week retrospective"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: a retrospective written for this prototype claims refund-status questions dominated an invented peak weekend, with no queue metrics attached.",
    whyItMatters:
      "Inference: uncertainty about refunds may cost staff time and make a simple policy feel opaque. The claim is weak without counts, so treat it as a question to ask.",
    novelty:
      "Demo novelty: refunds are unglamorous but often reveal how many systems a merchant is stitching together.",
    limitations:
      "Fabricated retrospective and no metrics. Should be rejected or saved until a real support sample exists.",
    confidence: "low",
    question:
      "When a refund is issued, what does the guest see, and who explains the timing?",
    tags: ["refunds", "support load", "peak"],
  },
  {
    key: "06",
    category: "peer",
    title: "A fictional peer markets one wallet across web and counter",
    ...DEMO_SOURCE(6, "invented peer homepage"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented peer homepage claims 'one wallet, every counter'. This page does not exist; it was written to illustrate a competitor-style message.",
    whyItMatters:
      "Inference: peer messaging may shape what merchants expect from a payments partner, even before they evaluate one. It does not prove the peer delivers it.",
    novelty:
      "Demo novelty: the contrast is between a single promise and a merchant's described patchwork. Use as a conversation frame, not a competitive fact.",
    limitations:
      "No real competitor, website, launch or certification behind this card. All capability claims are invented.",
    confidence: "low",
    question:
      "Which payment promise do your guests hear from other brands in your category?",
    tags: ["peer messaging", "wallet", "positioning"],
  },
  {
    key: "07",
    category: "peer",
    title: "An invented competitor advertises QR checkout in store",
    ...DEMO_SOURCE(7, "fabricated campaign board"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented campaign board shows a QR-at-table checkout concept with a same-day settlement line. The campaign, brand and claim are all fictional.",
    whyItMatters:
      "Inference: a QR-led counter experience may change staffing expectations. The settlement claim should not be repeated as fact.",
    novelty:
      "Demo novelty: the signal puts the payment moment at the table rather than the till.",
    limitations:
      "Fabricated campaign. The settlement claim is illustrative and not verified or offered as an Aurfy promise.",
    confidence: "low",
    question:
      "Would moving payment to the table change how your team handles peak service?",
    tags: ["QR", "in-store", "settlement"],
  },
  {
    key: "08",
    category: "peer",
    title: "A fictional competitor job ad hints at consolidating payment tooling",
    ...DEMO_SOURCE(8, "invented hiring notice"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented job notice lists 'simplify our payments stack' among responsibilities. No such role or company exists.",
    whyItMatters:
      "Inference: consolidation may be an active priority for comparable merchants. A hiring signal is suggestive at best and says nothing about results.",
    novelty:
      "Demo novelty: it frames integration simplicity as an organisational need, not only a technical one.",
    limitations:
      "Fabricated job notice. Do not cite as evidence about any real employer.",
    confidence: "low",
    question:
      "If payments work were consolidated, which team would own the change?",
    tags: ["hiring", "consolidation", "integration"],
  },
  {
    key: "09",
    category: "peer",
    title: "A fictional peer adds wholesale ordering to a retail brand",
    ...DEMO_SOURCE(9, "fabricated expansion note"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: an invented expansion note describes a retail peer adding a wholesale order form for cafés, without describing how it is paid for.",
    whyItMatters:
      "Inference: a new sales motion may create a second payment workflow alongside retail. Whether that is a problem for the merchant is unknown.",
    novelty:
      "Demo novelty: a business-model change can redraw the payment surface area overnight.",
    limitations:
      "Fabricated expansion note. No real brand, launch date or terms exist.",
    confidence: "low",
    question:
      "Are you taking orders through any channel that does not use your main checkout today?",
    tags: ["wholesale", "B2B", "workflow"],
  },
  {
    key: "10",
    category: "peer",
    title: "An invented competitor pilots tap-to-pay on staff phones",
    ...DEMO_SOURCE(10, "fictional field note"),
    sourceDate: null,
    retrievedAt: null,
    provenance: "demo",
    evidence:
      "Fictional demo evidence: a field note written for this prototype describes staff taking payment on phones at a pop-up. It names no real company and reports no results.",
    whyItMatters:
      "Inference: flexible acceptance may be attractive for markets and pop-ups, but reliability and training costs are unknown.",
    novelty:
      "Demo novelty: acceptance hardware, not checkout software, is the variable under discussion.",
    limitations:
      "Fabricated field note. No pilot, hardware or outcome exists.",
    confidence: "medium",
    question:
      "Do pop-ups or markets use the same payment setup as your permanent locations?",
    tags: ["tap to pay", "pop-up", "hardware"],
  },
];

export function freshSignals(merchantId: string): Signal[] {
  return seedSignals.map(({ key, ...seed }) => ({
    ...seed,
    id: `sg_${merchantId}_${key}`,
    status: "new" as SignalStatus,
    addedAt: now(),
    limitations: `${seed.limitations} Demo library item, loaded for this workspace.`,
  }));
}

function statusMapFor(merchantId: string, statuses: Record<string, SignalStatus>): Signal[] {
  return freshSignals(merchantId).map((signal) => {
    const key = signal.id.split("_").at(-1) ?? "";
    return { ...signal, status: statuses[key] ?? "new" };
  });
}

export function emptyBrief(): Brief {
  return {
    observed: "",
    hypotheses: "",
    unknowns: "",
    reviewed: false,
    updatedAt: now(),
    generatedFrom: [],
    generation: "manual",
  };
}

export function emptyOutreach(): OutreachDraft {
  return {
    observation: "",
    hypothesis: "",
    capability: "",
    question: "",
    generation: "manual",
    generationNote: "",
    signalId: null,
    capabilityId: null,
    angle: null,
    reviewed: false,
    updatedAt: now(),
  };
}

export function defaultCapabilities() {
  return DEFAULT_CAPABILITIES.map((capability) => ({ ...capability, edited: false }));
}

export function emptyPositioning(): Positioning {
  return {
    angle: null,
    capabilityIds: [],
    capabilities: defaultCapabilities(),
    reviewed: false,
    updatedAt: now(),
  };
}

export function emptyConcept(merchantName: string): ConceptDraft {
  return {
    headline: "",
    subhead: "",
    palette: "indigo",
    logoDataUrl: null,
    merchantDisplayName: merchantName,
    signalId: null,
    capabilityId: null,
    imageUrl: null,
    imagePrompt: null,
    imageGeneratedAt: null,
    layout: "editorial",
    displayFont: "bodoni",
    sendSafe: false,
    reviewed: false,
    updatedAt: now(),
  };
}

export function defaultPipeline(): PipelineEntry {
  return {
    stage: "research",
    nextAction: "",
    dueDate: "",
    notes: "",
    history: [{ stage: "research", at: now() }],
    updatedAt: now(),
  };
}

function briefForMarlow(): Brief {
  return {
    observed: [
      "• Fictional demo card 01: guests ask to split a counter bill between two phones.",
      "• Fictional demo card 03: a card saved in the app is not offered at the counter in the demo journey map.",
      "• Fictional demo card 06: an invented peer markets one wallet across web and counter.",
      "• Fictional demo card 08: an invented competitor job notice mentions consolidating payment tooling.",
    ].join("\n"),
    hypotheses: [
      "• Payment friction at the app-to-counter handoff may be suppressing repeat orders. (Inference, unverified.)",
      "• A single payment setup might reduce staff retraining when the next café opens. (Inference.)",
      "• Peer messaging about 'one wallet' may shape what the owner expects from a payments partner. (Inference; the peer claim itself is fictional.)",
    ].join("\n"),
    unknowns: [
      "• What share of repeat guests order in both the app and the café. (No data supplied.)",
      "• Effective rates, settlement timing and current provider terms. (Unknown — not supplied.)",
      "• Whether the owner prioritises service speed or integration simplicity. (Ask directly.)",
      "• Whether the third location is confirmed. (Demo premise only.)",
    ].join("\n"),
    reviewed: true,
    updatedAt: now(),
    generatedFrom: ["sg_marlow-fen_01", "sg_marlow-fen_03", "sg_marlow-fen_06", "sg_marlow-fen_08"],
    generation: "template",
  };
}

export function createDemoWorkspace(): WorkspaceState {
  const createdAt = now();
  const merchants: Merchant[] = [
    {
      id: "marlow-fen",
      name: "Marlow & Fen Coffee Co.",
      url: "https://marlowandfen.example",
      category: "Specialty coffee · 3 cafés + online beans",
      notes:
        "Fictional demo merchant. Owner-led team; app ordering and counter payments described as separate setups. Used to walk the full studio workflow.",
      isDemo: true,
      createdAt: daysAgo(12),
    },
    {
      id: "halcyon-swim",
      name: "Halcyon Swim",
      url: "https://halcyonswim.example",
      category: "DTC swimwear · seasonal drops",
      notes:
        "Fictional demo merchant. Small e-commerce team, pop-up events in summer. Outreach stage is a demo record; nothing was sent.",
      isDemo: true,
      createdAt: daysAgo(8),
    },
    {
      id: "fernway-grocers",
      name: "Fernway Grocers",
      url: "https://fernwaygrocers.example",
      category: "Neighbourhood grocer · 2 stores",
      notes:
        "Fictional demo merchant. Basket sizes are small and the queue matters. Demo signals are selected for the example concept; no real research was performed.",
      isDemo: true,
      createdAt: daysAgo(5),
    },
  ];

  const signalsByMerchant: Record<string, Signal[]> = {
    "marlow-fen": statusMapFor("marlow-fen", {
      "01": "selected",
      "03": "selected",
      "04": "saved",
      "05": "rejected",
      "06": "selected",
      "08": "selected",
    }),
    "halcyon-swim": statusMapFor("halcyon-swim", {
      "03": "selected",
      "06": "selected",
      "07": "saved",
      "05": "rejected",
    }),
    "fernway-grocers": statusMapFor("fernway-grocers", {
      "01": "selected",
      "08": "selected",
      "09": "saved",
      "10": "selected",
    }),
  };

  const concepts: Record<string, ConceptDraft> = {
    "marlow-fen": {
      headline: "One payment layer. Every counter.",
      subhead:
        "A connected payment experience across the Marlow & Fen app, the café counter and online beans, supported by one Aurfy setup.",
      palette: "clay",
      logoDataUrl: null,
      merchantDisplayName: "Marlow & Fen",
      signalId: "sg_marlow-fen_03",
      capabilityId: "cap_payments",
      imageUrl: "/examples/marlow-fen.jpg",
      imagePrompt: null,
      imageGeneratedAt: null,
      logoDataUrl: "/logos/marlow-fen.svg",
      layout: "editorial",
      displayFont: "bodoni",
      sendSafe: false,
      reviewed: true,
      updatedAt: now(),
    },
    "halcyon-swim": {
      headline: "Pay your way. Everywhere.",
      subhead:
        "One Aurfy checkout across seasonal drops, summer pop-ups and the online store — cards and digital wallets included.",
      palette: "teal",
      logoDataUrl: null,
      merchantDisplayName: "Halcyon Swim",
      signalId: "sg_halcyon-swim_03",
      capabilityId: "cap_wallets",
      imageUrl: "/examples/halcyon-swim.jpg",
      imagePrompt: null,
      imageGeneratedAt: null,
      logoDataUrl: "/logos/halcyon-swim.svg",
      layout: "cover",
      displayFont: "playfair",
      sendSafe: false,
      reviewed: true,
      updatedAt: now(),
    },
    "fernway-grocers": {
      headline: "One integration. Every checkout.",
      subhead: "A single Aurfy API keeps the app, two stores and weekend markets on one payments setup.",
      palette: "citron",
      logoDataUrl: null,
      merchantDisplayName: "Fernway Grocers",
      signalId: "sg_fernway-grocers_10",
      capabilityId: "cap_api",
      imageUrl: "/examples/fernway-grocers.jpg",
      imagePrompt: null,
      imageGeneratedAt: null,
      logoDataUrl: "/logos/fernway-grocers.svg",
      layout: "poster",
      displayFont: "fraunces",
      sendSafe: false,
      reviewed: true,
      updatedAt: now(),
    },
  };

  const outreach: Record<string, OutreachDraft> = {
    "marlow-fen": {
      observation:
        "In a fictional demo journey map, a guest saves a card in the Marlow & Fen app and is then asked for a different card at the counter.",
      hypothesis:
        "My hypothesis — not a finding — is that this seam between app and counter may make repeat ordering feel less joined-up than guests expect.",
      capability:
        "Aurfy can support online and in-store payments, so the same payment experience can continue from app to counter. Its unified API can keep the app, website and store systems connected without a separate integration for each.",
      question:
        "When a guest saves a card in your app, what would you want to happen the next time they order at the counter?",
      generation: "template",
      generationNote:
        "Deterministic template generated from the selected signal, angle and approved capability. No AI model was used.",
      signalId: "sg_marlow-fen_03",
      capabilityId: "cap_payments",
      angle: "connected",
      reviewed: false,
      updatedAt: now(),
    },
    "halcyon-swim": emptyOutreach(),
    "fernway-grocers": emptyOutreach(),
  };

  const pipeline: Record<string, PipelineEntry> = {
    "marlow-fen": {
      stage: "concept_ready",
      nextAction: "Review the outreach draft, copy it manually, then log the send",
      dueDate: daysAhead(2),
      notes:
        "Demo record. Signals and brief are illustrative; no message has been sent and no partnership exists.",
      history: [
        { stage: "research", at: daysAgo(9) },
        { stage: "concept_ready", at: daysAgo(2) },
      ],
      updatedAt: now(),
    },
    "halcyon-swim": {
      stage: "outreach_sent",
      nextAction: "Demo follow-up date — no automated reminder is sent",
      dueDate: daysAhead(4),
      notes:
        "Demo record only. This stage exists to show the pipeline; no email, DM or social message was sent.",
      history: [
        { stage: "research", at: daysAgo(7) },
        { stage: "outreach_sent", at: daysAgo(3) },
      ],
      updatedAt: now(),
    },
    "fernway-grocers": {
      stage: "research",
      nextAction: "Select two customer and two peer signals from the demo library",
      dueDate: daysAhead(1),
      notes: "Demo record. No research has been performed for this fictional merchant.",
      history: [{ stage: "research", at: daysAgo(5) }],
      updatedAt: now(),
    },
  };

  const positioning: Record<string, Positioning> = {
    "marlow-fen": {
      angle: "connected",
      capabilityIds: ["cap_payments", "cap_api"],
      capabilities: defaultCapabilities(),
      reviewed: true,
      updatedAt: now(),
    },
    "halcyon-swim": {
      angle: "choice",
      capabilityIds: ["cap_wallets", "cap_payments"],
      capabilities: defaultCapabilities(),
      reviewed: true,
      updatedAt: now(),
    },
    "fernway-grocers": {
      angle: "simpler",
      capabilityIds: ["cap_api"],
      capabilities: defaultCapabilities(),
      reviewed: true,
      updatedAt: now(),
    },
  };

  return {
    version: 1,
    merchants,
    activeMerchantId: "marlow-fen",
    signalsByMerchant,
    briefs: {
      "marlow-fen": briefForMarlow(),
      "halcyon-swim": emptyBrief(),
      "fernway-grocers": emptyBrief(),
    },
    positioning,
    concepts,
    outreach,
    pipeline,
    seededAt: createdAt,
    updatedAt: createdAt,
  };
}
