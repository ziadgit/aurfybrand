import { useCallback, useEffect, useState } from "react";
import { ANGLES, DEFAULT_CAPABILITIES } from "./content";
import type { AngleId } from "./types";

/**
 * Social audience step (LinkedIn / X). Plans posts, keeps hand-entered results,
 * and turns merchant engagers into pipeline records. Nothing is posted and no
 * social account is connected: every number here is typed in by a person.
 * Stored separately from the merchant workspace so its schema stays untouched.
 */

export type SocialChannel = "linkedin" | "x";
export type SocialSegment = "ecommerce" | "restaurant" | "retail" | "services";
export type PostStatus = "planned" | "posted";

export type SocialPost = {
  id: string;
  channel: SocialChannel;
  angle: AngleId;
  segment: SocialSegment;
  text: string;
  status: PostStatus;
  postedOn: string | null;
  impressions: number | null;
  engagements: number | null;
  siteVisits: number | null;
  /** Merchants (or merchant-side people) who engaged and are worth a follow-up. */
  engagers: string[];
  /** Engagers already added to the prospect pipeline. */
  addedToPipeline: string[];
  isDemo: boolean;
  createdAt: string;
};

export const CHANNELS: { id: SocialChannel; label: string; limit: number }[] = [
  { id: "linkedin", label: "LinkedIn", limit: 3000 },
  { id: "x", label: "X", limit: 280 },
];

export const SEGMENTS: { id: SocialSegment; label: string; audience: string; moment: string }[] = [
  { id: "ecommerce", label: "E-commerce", audience: "e-commerce teams", moment: "between the app, the site and the marketplace" },
  { id: "restaurant", label: "Restaurants", audience: "restaurant operators", moment: "between the counter, the order-ahead app and delivery" },
  { id: "retail", label: "Retail", audience: "retail brands", moment: "between the store, the pop-up and the online shop" },
  { id: "services", label: "Services", audience: "service businesses", moment: "between the booking, the deposit and the final bill" },
];

const STORAGE_KEY = "aurfy-social-v1";

export function utmLink(post: Pick<SocialPost, "channel" | "angle" | "segment" | "id">): string {
  const params = new URLSearchParams({
    utm_source: post.channel,
    utm_medium: "social",
    utm_campaign: `${post.angle}-${post.segment}`,
    utm_content: post.id,
  });
  return `https://aurfy.com/?${params.toString()}`;
}

/**
 * Deterministic draft. Claims stay inside the approved capability wording; the
 * question invites replies rather than asserting results.
 */
export function draftPost(channel: SocialChannel, angle: AngleId, segment: SocialSegment, observation: string): string {
  const angleMeta = ANGLES.find((item) => item.id === angle) ?? ANGLES[0];
  const seg = SEGMENTS.find((item) => item.id === segment) ?? SEGMENTS[0];
  const capability =
    DEFAULT_CAPABILITIES.find(
      (item) => item.id === (angle === "choice" ? "cap_wallets" : angle === "simpler" ? "cap_api" : "cap_payments"),
    ) ?? DEFAULT_CAPABILITIES[0];
  const hook = observation.trim() || `A lot of ${seg.audience} lose the thread ${seg.moment}.`;

  if (channel === "x") {
    return `${hook}\n\n${angleMeta.short}\n\nWhere does payment get awkward for you? #payments`;
  }
  return [
    hook,
    "",
    `${angleMeta.lead}. ${angleMeta.short}`,
    "",
    `${capability.statement} Aurfy is the company behind NihaoPay, and it covers more than Asian wallets and cross-border payments.`,
    "",
    `Question for ${seg.audience}: where does the payment step feel most disconnected today?`,
  ].join("\n");
}

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);

function demoPosts(): SocialPost[] {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-post-1",
      channel: "linkedin",
      angle: "connected",
      segment: "restaurant",
      text: draftPost("linkedin", "connected", "restaurant", ""),
      status: "posted",
      postedOn: iso(6),
      impressions: 2400,
      engagements: 61,
      siteVisits: 18,
      engagers: ["Marlow & Fen Coffee Co.", "Cedar & Crumb"],
      addedToPipeline: ["Marlow & Fen Coffee Co."],
      isDemo: true,
      createdAt: now,
    },
    {
      id: "demo-post-2",
      channel: "x",
      angle: "choice",
      segment: "retail",
      text: draftPost("x", "choice", "retail", ""),
      status: "posted",
      postedOn: iso(3),
      impressions: 5100,
      engagements: 44,
      siteVisits: 6,
      engagers: ["Halcyon Swim"],
      addedToPipeline: [],
      isDemo: true,
      createdAt: now,
    },
    {
      id: "demo-post-3",
      channel: "linkedin",
      angle: "simpler",
      segment: "ecommerce",
      text: draftPost("linkedin", "simpler", "ecommerce", ""),
      status: "planned",
      postedOn: null,
      impressions: null,
      engagements: null,
      siteVisits: null,
      engagers: [],
      addedToPipeline: [],
      isDemo: true,
      createdAt: now,
    },
  ];
}

function load(): SocialPost[] {
  if (typeof window === "undefined") return demoPosts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoPosts();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SocialPost[]) : demoPosts();
  } catch {
    return demoPosts();
  }
}

export function useSocialPlan() {
  const [posts, setPosts] = useState<SocialPost[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // Storage full or blocked: the plan still works for this session.
    }
  }, [posts]);

  const addPost = useCallback((input: Pick<SocialPost, "channel" | "angle" | "segment" | "text">) => {
    const post: SocialPost = {
      ...input,
      id: `post_${Date.now().toString(36)}`,
      status: "planned",
      postedOn: null,
      impressions: null,
      engagements: null,
      siteVisits: null,
      engagers: [],
      addedToPipeline: [],
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    setPosts((current) => [post, ...current]);
    return post;
  }, []);

  const updatePost = useCallback((id: string, patch: Partial<SocialPost>) => {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  }, []);

  const removePost = useCallback((id: string) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  }, []);

  const clearDemo = useCallback(() => {
    setPosts((current) => current.filter((post) => !post.isDemo));
  }, []);

  return { posts, addPost, updatePost, removePost, clearDemo };
}

export type AngleResult = {
  angle: AngleId;
  label: string;
  posted: number;
  impressions: number;
  engagementRate: number | null;
  siteVisits: number;
  merchantEngagers: number;
  addedToPipeline: number;
  engagersPerPost: number | null;
};

/** Per-angle roll-up of posted content: which message earns merchant attention. */
export function resultsByAngle(posts: SocialPost[]): AngleResult[] {
  return ANGLES.map((angle) => {
    const posted = posts.filter((post) => post.angle === angle.id && post.status === "posted");
    const impressions = posted.reduce((sum, post) => sum + (post.impressions ?? 0), 0);
    const engagements = posted.reduce((sum, post) => sum + (post.engagements ?? 0), 0);
    const merchantEngagers = posted.reduce((sum, post) => sum + post.engagers.length, 0);
    return {
      angle: angle.id,
      label: angle.label,
      posted: posted.length,
      impressions,
      engagementRate: impressions > 0 ? engagements / impressions : null,
      siteVisits: posted.reduce((sum, post) => sum + (post.siteVisits ?? 0), 0),
      merchantEngagers,
      addedToPipeline: posted.reduce((sum, post) => sum + post.addedToPipeline.length, 0),
      engagersPerPost: posted.length > 0 ? merchantEngagers / posted.length : null,
    };
  });
}
