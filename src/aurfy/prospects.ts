import type { MerchantSource, Signal } from "./types";

export type ProspectSource = Extract<MerchantSource, "public" | "clay_simulated">;
export type ProspectSignalSeed = Omit<Signal, "id" | "status" | "addedAt">;

export type ProspectClayFields = {
  employees: string;
  locations: string;
  techStack: string[];
  intentTopics: string[];
  contactRole: string;
  recentEvent: string;
};

export type Prospect = {
  key: string;
  name: string;
  url: string;
  category: string;
  summary: string;
  locations: string;
  channels: string[];
  source: ProspectSource;
  retrievedAt: string | null;
  sourceUrls: string[];
  logo: string | null;
  clayFields?: ProspectClayFields;
  signals: ProspectSignalSeed[];
};

/** The date these public pages were actually read for this prototype. */
export const PUBLIC_SNAPSHOT_DATE = "2026-11-18T00:00:00.000Z";

const publicMeta = (sourceName: string, sourceUrl: string) => ({
  sourceName,
  sourceUrl,
  sourceDate: null,
  retrievedAt: PUBLIC_SNAPSHOT_DATE,
  provenance: "public" as const,
  confidence: "medium" as const,
});

const clayMeta = {
  sourceName: "Clay simulation (synthetic enrichment)",
  sourceUrl: "",
  sourceDate: null,
  retrievedAt: null,
  provenance: "clay" as const,
  confidence: "low" as const,
};

const clayLimits =
  "Synthetic Clay simulation. No real Clay account, API, source page, merchant, review or engagement data exists behind this record.";

export const PROSPECTS: Prospect[] = [
  {
    key: "verve",
    name: "Verve Coffee Roasters",
    url: "https://www.vervecoffee.com/",
    category: "Specialty coffee · cafés + online subscriptions",
    summary:
      "Public pages list cafés across Los Angeles, Santa Cruz, San Francisco, Palo Alto and Japan, with Toast-hosted order-ahead and a separate online shop.",
    locations: "Cafés across LA, Santa Cruz, SF, Palo Alto and Japan",
    channels: ["Cafés", "Order ahead", "Online shop", "Subscriptions"],
    source: "public",
    retrievedAt: PUBLIC_SNAPSHOT_DATE,
    sourceUrls: ["https://www.vervecoffee.com/pages/locations", "https://www.vervecoffee.com/"],
    logo: "https://www.vervecoffee.com/cdn/shop/files/favicon_33d2d288-2905-49cf-86a5-8525204526bc.png?crop=center&height=200&v=1650427325&width=200",
    signals: [
      {
        category: "customer",
        title: "Order-ahead, online shop and subscriptions sit side by side",
        ...publicMeta("Verve Coffee Roasters — public locations and homepage", "https://www.vervecoffee.com/pages/locations"),
        evidence:
          "Observed on public Verve pages (read 18 Nov 2026): the locations page lists cafés in Los Angeles, Santa Cruz, San Francisco, Palo Alto and Japan with 'order ahead' links to Toast-hosted pages. The homepage separately offers an online shop and coffee subscriptions.",
        whyItMatters:
          "Inference: the public journey spans hosted café order-ahead, e-commerce and subscriptions. The pages do not state whether those surfaces share a payment relationship.",
        novelty:
          "Public snapshot: the question is the seam between café order-ahead and the online store, not the existence of either.",
        limitations:
          "Public page snapshot only. No order volume, payment stack, fees or guest behaviour was available; pages were not audited beyond the cited text.",
        question: "Do café order-ahead, subscriptions and online orders share one payment relationship today?",
        tags: ["order ahead", "subscriptions", "channels", "public source"],
      },
      {
        category: "peer",
        title: "Peer café brands separate order-ahead, online shop and gifting",
        ...publicMeta("Peer public snapshots — Sightglass and Dandelion", "https://www.sightglasscoffee.com/"),
        evidence:
          "Observed on public peer pages (read 18 Nov 2026): Sightglass links Toast-hosted order-ahead at several cafés while running an online shop and subscription; Dandelion separates online shop, scheduled delivery and gifting from its café locations.",
        whyItMatters:
          "Inference: comparable specialty brands appear to run several customer-facing commerce surfaces. This is a pattern to test, not proof of a competitor's payment setup.",
        novelty:
          "Cross-brand public observation: the contrast is between many front doors and the absence of public detail about the payment layer behind them.",
        limitations:
          "Only public pages were read. No competitor provider, contract or performance data is known or implied.",
        question: "Which customer entry point is hardest to keep consistent across café, online shop and gifting?",
        tags: ["peer pattern", "order ahead", "gifting", "public source"],
      },
    ],
  },
  {
    key: "sightglass",
    name: "Sightglass Coffee",
    url: "https://www.sightglasscoffee.com/",
    category: "Specialty coffee · 5 cafés + online subscriptions",
    summary:
      "Public homepage lists five cafés, order-ahead links at several locations, an online coffee shop and a subscription offer.",
    locations: "5 cafés: SoMa, Berkeley, Hollywood, Mission, Divisadero",
    channels: ["Cafés", "Order ahead", "Online shop", "Subscriptions"],
    source: "public",
    retrievedAt: PUBLIC_SNAPSHOT_DATE,
    sourceUrls: ["https://www.sightglasscoffee.com/", "https://sightglasscoffee.com/pages/subscriptions"],
    logo: "https://sightglasscoffee.com/cdn/shop/files/Sightglass-logo-digital-800x800.png?v=1746833002&width=500",
    signals: [
      {
        category: "customer",
        title: "Five cafés, order-ahead links and an online subscription",
        ...publicMeta("Sightglass Coffee — public homepage and subscription page", "https://www.sightglasscoffee.com/"),
        evidence:
          "Observed on the public Sightglass homepage (read 18 Nov 2026): it lists SoMa, Berkeley, Hollywood, Mission and Divisadero cafés, shows 'Order Ahead' links for several, and offers online shop and subscription links, including a Single Origin Series.",
        whyItMatters:
          "Inference: a guest may meet the brand through café order-ahead, a subscription or the online shop. The public pages do not explain whether these share one payment setup.",
        novelty:
          "Public snapshot: the multi-café footprint plus a recurring subscription makes the channel handoff worth asking about.",
        limitations:
          "Public homepage only. No payment stack, order volume or customer-account behaviour was disclosed.",
        question: "If a subscriber also orders ahead in a café, do both experiences recognise the same customer?",
        tags: ["order ahead", "subscription", "cafés", "public source"],
      },
      {
        category: "peer",
        title: "Peers separate café ordering, online shop and gifting",
        ...publicMeta("Peer public snapshots — Verve and Dandelion", "https://www.vervecoffee.com/pages/locations"),
        evidence:
          "Observed on public peer pages (read 18 Nov 2026): Verve links café order-ahead to Toast alongside an online shop and subscriptions; Dandelion separates online shop, scheduled delivery and gifting from its five locations.",
        whyItMatters:
          "Inference: peer brands show a recurring pattern of separate customer-facing commerce surfaces. Treat it as a discussion hypothesis, not a verified payment gap.",
        novelty:
          "Cross-brand public observation: the pattern is consistent enough to ask about, but the public pages do not reveal the underlying payment stack.",
        limitations:
          "Only public pages were read. No competitor provider, contract or performance data is known or implied.",
        question: "Which of your customer entry points shares the least context with the others?",
        tags: ["peer pattern", "gifting", "channels", "public source"],
      },
    ],
  },
  {
    key: "dandelion",
    name: "Dandelion Chocolate",
    url: "https://www.dandelionchocolate.com/",
    category: "Bean-to-bar chocolate · 5 locations + online & gifting",
    summary:
      "Public homepage lists five locations and combines an online shop with scheduled holiday delivery, e-gifting and classes or tours.",
    locations: "5 locations: 16th St, Valencia, Ferry Building, Fillmore, The Venetian",
    channels: ["Locations", "Online shop", "Scheduled delivery", "E-gifting", "Classes & tours"],
    source: "public",
    retrievedAt: PUBLIC_SNAPSHOT_DATE,
    sourceUrls: ["https://www.dandelionchocolate.com/"],
    logo: "https://www.dandelionchocolate.com/cdn/shop/files/D_Favicon.png?crop=center&height=200&v=1738499517&width=200",
    signals: [
      {
        category: "customer",
        title: "Scheduled delivery and e-gifting extend the journey beyond the café",
        ...publicMeta("Dandelion Chocolate — public homepage", "https://www.dandelionchocolate.com/"),
        evidence:
          "Observed on the public Dandelion homepage (read 18 Nov 2026): it lists five locations (16th Street, Valencia, Ferry Building, Fillmore and The Venetian), advertises 'Shop Now, Ship Later' holiday delivery, a separate e-gifting site and classes or tours.",
        whyItMatters:
          "Inference: gifting and scheduled delivery may add payment and fulfilment expectations that differ from an in-person purchase. The page does not describe the payment setup.",
        novelty:
          "Public snapshot: physical locations, scheduled delivery and a separate gifting flow make a useful conversation opener.",
        limitations:
          "Public homepage only. No order volume, delivery performance, payment provider or customer data was available.",
        question: "When a gift order is scheduled for a later date, how does the payment authorisation and refund path work?",
        tags: ["gifting", "scheduled delivery", "locations", "public source"],
      },
      {
        category: "peer",
        title: "Peers run separate café, shop and gifting surfaces",
        ...publicMeta("Peer public snapshots — Verve and Sightglass", "https://www.vervecoffee.com/pages/locations"),
        evidence:
          "Observed on public peer pages (read 18 Nov 2026): Verve uses Toast-hosted café order-ahead alongside an online shop and subscriptions; Sightglass links order-ahead at five cafés and offers an online subscription.",
        whyItMatters:
          "Inference: a multi-surface pattern appears across specialty food and beverage brands. It does not prove a payment problem at Dandelion.",
        novelty:
          "Cross-brand public observation: the pattern links café, e-commerce and gifting surfaces without disclosing the payment infrastructure.",
        limitations: "Only public pages were read. No competitor provider or contract is implied.",
        question: "Which surface — café, shop or gifting — creates the most manual reconciliation today?",
        tags: ["peer pattern", "gifting", "public source"],
      },
    ],
  },
  {
    key: "alder-ash",
    name: "Alder & Ash Coffee",
    url: "https://alderandash.example",
    category: "Specialty coffee · 4 cafés + online (simulated)",
    summary: "Synthetic Clay record: a fictional four-café coffee group with an app, loyalty programme and online bean shop.",
    locations: "4 cafés (simulated)",
    channels: ["Cafés", "Mobile app", "Online shop", "Loyalty"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "45 (simulated)",
      locations: "4 cafés (simulated)",
      techStack: ["Shopify", "Toast", "Loyalty app"],
      intentTopics: ["Store expansion", "Payment consolidation"],
      contactRole: "Head of Retail (simulated)",
      recentEvent: "Opened a fourth café (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated reviews mention split loyalty balances",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional review themes describe guests holding loyalty balances in an app that café staff cannot see. No real review or merchant exists.",
        whyItMatters:
          "Inference to test: if balances live in two places, guests may not trust the programme across channels. The synthetic record provides no evidence of frequency or financial impact.",
        novelty: "Simulated novelty rationale: the app-to-counter handoff is the angle, not the loyalty programme itself.",
        limitations: clayLimits,
        question: "When a guest earns or spends loyalty in the app, what does café staff see?",
        tags: ["clay-simulation", "loyalty", "app", "counter"],
      },
      {
        category: "peer",
        title: "Simulated competitor launches one-wallet checkout",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional peer is described as advertising one wallet across web and café. The competitor, claim and campaign are invented.",
        whyItMatters:
          "Inference to test: peer messaging may shape what this merchant expects from a payments partner. It is not a verified competitor capability or result.",
        novelty: "Simulated novelty rationale: the contrast is between a single promise and the merchant's described patchwork.",
        limitations: clayLimits,
        question: "Which payment promise are your guests hearing from other coffee brands?",
        tags: ["clay-simulation", "peer", "wallet"],
      },
      {
        category: "customer",
        title: "Simulated intent: tap-to-pay at pop-ups",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional event feedback describes guests expecting tap-to-pay at a weekend market. No real event, merchant or feedback exists.",
        whyItMatters:
          "Inference to test: flexible acceptance may matter for off-site events, but reliability and hardware costs are unknown.",
        novelty: "Simulated novelty rationale: acceptance hardware, not checkout software, is the variable under discussion.",
        limitations: clayLimits,
        question: "Do pop-ups use the same acceptance setup as the permanent cafés?",
        tags: ["clay-simulation", "tap to pay", "pop-up"],
      },
    ],
  },
  {
    key: "northline",
    name: "Northline Swim",
    url: "https://northlineswim.example",
    category: "DTC swimwear · seasonal drops + pop-ups (simulated)",
    summary: "Synthetic Clay record: a fictional DTC swimwear brand running seasonal online drops and two summer pop-ups.",
    locations: "2 pop-ups (simulated)",
    channels: ["Online store", "Pop-ups", "Email/SMS"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "18 (simulated)",
      locations: "2 pop-ups (simulated)",
      techStack: ["Shopify", "Klaviyo", "Stripe"],
      intentTopics: ["International expansion", "Returns experience"],
      contactRole: "Ecommerce Lead (simulated)",
      recentEvent: "Planning a first international drop (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated returns questions cluster after drops",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional support themes describe return-status questions after seasonal drops. No real customer, order or review exists.",
        whyItMatters:
          "Inference to test: return clarity may matter as much as checkout speed for a drop-led brand. The synthetic record cannot show volume or financial impact.",
        novelty: "Simulated novelty rationale: a returns question is an unglamorous but useful doorway into payment operations.",
        limitations: clayLimits,
        question: "When a drop sells out and a return is requested, what does the customer see?",
        tags: ["clay-simulation", "returns", "drops"],
      },
      {
        category: "peer",
        title: "Simulated peer adds wallet messaging for pop-ups",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional peer is described as promoting a single wallet across its online store and summer pop-ups. The peer and campaign do not exist.",
        whyItMatters:
          "Inference to test: a peer's public promise might influence merchant expectations, but it is not proof of adoption or performance.",
        novelty: "Simulated novelty rationale: the pop-up is the interesting payment surface, not the online store.",
        limitations: clayLimits,
        question: "What payment methods do pop-up guests ask for that the online store already supports?",
        tags: ["clay-simulation", "peer", "pop-up"],
      },
    ],
  },
  {
    key: "cedar-crumb",
    name: "Cedar & Crumb",
    url: "https://cedarandcrumb.example",
    category: "Bakery cafés · 3 locations + wholesale (simulated)",
    summary: "Synthetic Clay record: a fictional bakery group with three cafés, a wholesale order form and a small online shop.",
    locations: "3 cafés (simulated)",
    channels: ["Cafés", "Wholesale", "Online shop"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "70 (simulated)",
      locations: "3 cafés (simulated)",
      techStack: ["Square", "Shopify", "Spreadsheet-based wholesale"],
      intentTopics: ["Wholesale invoicing", "Payment consolidation"],
      contactRole: "Operations Director (simulated)",
      recentEvent: "Added a third café and a wholesale customer (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated wholesale orders run beside café payments",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional notes describe wholesale orders being invoiced outside the café payment setup. No real merchant, invoice or workflow exists.",
        whyItMatters:
          "Inference to test: a second order-to-cash workflow may create reconciliation work. The synthetic record provides no transaction evidence.",
        novelty: "Simulated novelty rationale: the next conversation may be about the whole order-to-cash path, not just the café checkout.",
        limitations: clayLimits,
        question: "How are wholesale orders paid today, and where does that process meet the café systems?",
        tags: ["clay-simulation", "wholesale", "invoicing"],
      },
      {
        category: "peer",
        title: "Simulated peer consolidates café and wholesale payments",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional bakery peer is described as moving wholesale invoicing onto its main payment platform. No real peer, migration or result exists.",
        whyItMatters:
          "Inference to test: consolidation may be a relevant peer message, but the synthetic record cannot support a competitive claim.",
        novelty: "Simulated novelty rationale: wholesale is the channel difference worth exploring, not the café checkout.",
        limitations: clayLimits,
        question: "If café and wholesale payments were in one place, which team would own the change?",
        tags: ["clay-simulation", "peer", "consolidation"],
      },
    ],
  },
  {
    key: "ledgerlight",
    name: "Ledgerlight",
    url: "https://ledgerlight.example",
    category: "Fintech · cashflow software (simulated)",
    summary:
      "Synthetic Clay record: a fictional cashflow and spend platform for small businesses, sold as a monthly subscription with a commercial card programme.",
    locations: "Remote-first, 2 hubs (simulated)",
    channels: ["Web app", "Mobile app", "Subscription billing"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "85 (simulated)",
      locations: "Remote-first, 2 hubs (simulated)",
      techStack: ["Subscription billing", "Open banking data", "Data warehouse"],
      intentTopics: ["Billing consolidation", "Card programme expansion"],
      contactRole: "Head of Revenue Operations (simulated)",
      recentEvent: "Launched a spend card for small teams (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated finance teams reconcile billing and card spend separately",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional support notes describe finance teams exporting subscription invoices and card transactions into one spreadsheet. No real merchant, customer or export exists.",
        whyItMatters:
          "Inference to test: if subscription billing and card spend sit in different systems, month-end reconciliation becomes manual. The synthetic record offers no evidence of volume or cost.",
        novelty: "Simulated novelty rationale: the seam between billing and card spend is the question, not the product catalogue.",
        limitations: clayLimits,
        question: "Which system does a finance team trust for the month-end number today?",
        tags: ["clay-simulation", "billing", "reconciliation"],
      },
      {
        category: "peer",
        title: "Simulated peer bundles billing and cards into one statement",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional cashflow peer is described as marketing one statement for subscriptions and card spend. The competitor and campaign are invented.",
        whyItMatters:
          "Inference to test: a combined statement may shape buyer expectations, but it says nothing about the peer's real capability or adoption.",
        novelty: "Simulated novelty rationale: the message is about a single monthly view, not a feature list.",
        limitations: clayLimits,
        question: "What would a single monthly statement have to include for your finance team to rely on it?",
        tags: ["clay-simulation", "peer", "statement"],
      },
    ],
  },
  {
    key: "wayfarer-collective",
    name: "Wayfarer Collective",
    url: "https://wayfarercollective.example",
    category: "Travel · small-group trips (simulated)",
    summary:
      "Synthetic Clay record: a fictional small-group travel operator taking deposits online, balancing final payments and refunds across bookings.",
    locations: "12 destinations (simulated)",
    channels: ["Website booking", "Deposits", "Partner agencies"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "60 (simulated)",
      locations: "12 destinations (simulated)",
      techStack: ["Booking engine", "Payment links", "Accounting suite"],
      intentTopics: ["Deposit reconciliation", "Cross-border refunds"],
      contactRole: "Head of Guest Experience (simulated)",
      recentEvent: "Added three departures for next season (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated guests ask where their deposit went",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional support themes describe guests asking what a deposit covered and when the balance would be taken. No real guest, booking or payment exists.",
        whyItMatters:
          "Inference to test: deposit and balance clarity may determine whether a guest books with confidence. The synthetic record cannot show abandonment or refund volume.",
        novelty: "Simulated novelty rationale: the split between deposit and balance is a payment-experience question, not a marketing one.",
        limitations: clayLimits,
        question: "When a guest pays a deposit, what can they see before the balance is due?",
        tags: ["clay-simulation", "deposits", "bookings"],
      },
      {
        category: "peer",
        title: "Simulated operator advertises one-tap balance payments",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional travel peer is described as advertising a single payment link for the remaining balance. The peer and campaign do not exist.",
        whyItMatters:
          "Inference to test: a simpler balance payment may shape what travellers expect, but it is not proof of adoption or performance.",
        novelty: "Simulated novelty rationale: the balance moment is the surface worth comparing, not the booking page.",
        limitations: clayLimits,
        question: "Do balance reminders and payment links live in the same system today?",
        tags: ["clay-simulation", "peer", "balance"],
      },
    ],
  },
  {
    key: "market-lane",
    name: "Market Lane",
    url: "https://marketlane.example",
    category: "Ecommerce · curated marketplace (simulated)",
    summary:
      "Synthetic Clay record: a fictional marketplace hosting independent sellers, with split payments at checkout and periodic seller payouts.",
    locations: "Online, 40 sellers (simulated)",
    channels: ["Marketplace", "Seller portal", "Mobile web"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "30 (simulated)",
      locations: "Online, 40 sellers (simulated)",
      techStack: ["Marketplace platform", "Split payments", "Shipping integration"],
      intentTopics: ["Seller payouts", "Returns handling"],
      contactRole: "Marketplace Operations Lead (simulated)",
      recentEvent: "Grew from 22 to 40 sellers (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated sellers rebuild payout reports every week",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional seller messages describe exporting orders and payouts to check a missing sale. No real seller, order or payout exists.",
        whyItMatters:
          "Inference to test: if sellers cannot trace a payout, support load and trust may suffer. The synthetic record provides no volumes or dispute rates.",
        novelty: "Simulated novelty rationale: seller payout transparency is the operational question behind marketplace growth.",
        limitations: clayLimits,
        question: "Which payout report do sellers use when they query a missing sale?",
        tags: ["clay-simulation", "payouts", "sellers"],
      },
      {
        category: "peer",
        title: "Simulated marketplace promises same-day seller payouts",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional marketplace peer is described as advertising same-day payouts to new sellers. The peer, promise and timing are invented.",
        whyItMatters:
          "Inference to test: payout speed may become a seller-acquisition message, though the real cost and risk are unknown.",
        novelty: "Simulated novelty rationale: payout timing is the differentiator being tested, not catalogue size.",
        limitations: clayLimits,
        question: "What would same-day payouts require from your reconciliation process?",
        tags: ["clay-simulation", "peer", "payout speed"],
      },
    ],
  },
  {
    key: "askwell",
    name: "Askwell",
    url: "https://askwell.example",
    category: "AI & search · answer engine (simulated)",
    summary:
      "Synthetic Clay record: a fictional AI answer engine sold as team seats with metered API usage on top of the subscription.",
    locations: "Remote-first (simulated)",
    channels: ["Web app", "API", "Team billing"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "40 (simulated)",
      locations: "Remote-first (simulated)",
      techStack: ["Usage metering", "Subscription billing", "Tax engine"],
      intentTopics: ["Usage-based billing", "Invoice clarity"],
      contactRole: "Head of Finance (simulated)",
      recentEvent: "Introduced usage-based pricing (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated teams query metered usage on invoices",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional billing threads describe customers asking which requests produced a usage line. No real customer, invoice or usage data exists.",
        whyItMatters:
          "Inference to test: a usage charge that cannot be traced back to activity may delay payment or trigger disputes. The synthetic record shows no dispute rate.",
        novelty: "Simulated novelty rationale: traceability of usage is the payment question, not the model or its quality.",
        limitations: clayLimits,
        question: "Can a customer trace a line on the invoice back to the request that caused it?",
        tags: ["clay-simulation", "usage billing", "invoices"],
      },
      {
        category: "peer",
        title: "Simulated answer engine advertises a flat usage allowance",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional AI search peer is described as marketing a flat monthly allowance instead of metered pricing. The peer and offer are invented.",
        whyItMatters:
          "Inference to test: predictable pricing may matter more than unit price for buyers comparing AI tools. This is a hypothesis, not a market finding.",
        novelty: "Simulated novelty rationale: predictability is the buyer question, not model benchmarks.",
        limitations: clayLimits,
        question: "Would a flat allowance make enterprise buyers more comfortable than metered usage?",
        tags: ["clay-simulation", "peer", "pricing"],
      },
    ],
  },
  {
    key: "cadence-ops",
    name: "Cadence Ops",
    url: "https://cadenceops.example",
    category: "SaaS · B2B project operations (simulated)",
    summary:
      "Synthetic Clay record: a fictional B2B project operations platform selling annual contracts with seat expansion and procurement review.",
    locations: "Remote-first, US + EU (simulated)",
    channels: ["Self-serve", "Sales-assisted", "Annual invoicing"],
    source: "clay_simulated",
    retrievedAt: null,
    sourceUrls: [],
    logo: null,
    clayFields: {
      employees: "210 (simulated)",
      locations: "Remote-first, US + EU (simulated)",
      techStack: ["Subscription management", "ERP", "CRM"],
      intentTopics: ["Procurement-ready invoicing", "Multi-currency"],
      contactRole: "VP Finance (simulated)",
      recentEvent: "Won a multi-region enterprise account (simulated)",
    },
    signals: [
      {
        category: "customer",
        title: "Simulated buyers need procurement-ready invoices",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: fictional procurement threads describe invoices being rejected for missing purchase-order references. No real buyer, invoice or rejection exists.",
        whyItMatters:
          "Inference to test: invoice format can gate payment even when the contract is signed. The synthetic record cannot show how often this happens.",
        novelty: "Simulated novelty rationale: the payment delay sits in procurement paperwork, not in the product.",
        limitations: clayLimits,
        question: "What has to be on an invoice before procurement will release payment?",
        tags: ["clay-simulation", "procurement", "invoicing"],
      },
      {
        category: "peer",
        title: "Simulated SaaS peer bills in local currency",
        ...clayMeta,
        evidence:
          "Synthetic Clay simulation: a fictional operations peer is described as advertising local-currency billing in every market it sells into. The peer and offer are invented.",
        whyItMatters:
          "Inference to test: local-currency invoicing may reduce friction with finance teams, though the operational cost is unknown.",
        novelty: "Simulated novelty rationale: the currency of the invoice is the question, not the product roadmap.",
        limitations: clayLimits,
        question: "Do buyers ask for local-currency billing before or after legal review?",
        tags: ["clay-simulation", "peer", "currency"],
      },
    ],
  },
];

export function prospectScore(prospect: Prospect) {
  let score = 34;
  const reasons: string[] = [];

  if (prospect.channels.length >= 3) {
    score += 16;
    reasons.push(`${prospect.channels.length} customer channels in the record`);
  }
  if (/caf|location|store|pop-up|shop|destination|hub|remote|online|market/i.test(prospect.locations)) {
    score += 13;
    reasons.push(`Footprint: ${prospect.locations}`);
  }
  if (
    /coffee|chocolate|bakery|grocer|swim|food|retail|fintech|travel|tour|booking|marketplace|ecommerce|commerce|saas|software|search|\bai\b/i.test(
      prospect.category,
    )
  ) {
    score += 10;
    reasons.push("Category fits a payments conversation");
  }
  if (
    prospect.signals.some((signal) => signal.category === "customer") &&
    prospect.signals.some((signal) => signal.category === "peer")
  ) {
    score += 10;
    reasons.push("Customer and peer lenses both present");
  }
  const publicCount = prospect.signals.filter((signal) => signal.provenance === "public").length;
  if (publicCount > 0) {
    score += 7;
    reasons.push(`${publicCount} publicly sourced signal${publicCount === 1 ? "" : "s"}`);
  }
  if (prospect.source === "clay_simulated") {
    reasons.push("Synthetic enrichment — no live verification");
  }

  return { score: Math.min(97, score), reasons: reasons.slice(0, 4) };
}
