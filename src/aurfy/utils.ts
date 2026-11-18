import type { Merchant, Provenance } from "./types";

export function formatDate(value: string | null | undefined, fallback = "Not available"): string {
  if (!value) return fallback;
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function dueLabel(value: string): { label: string; tone: "overdue" | "today" | "soon" | "later" | "none" } {
  if (!value) return { label: "No due date", tone: "none" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { label: value, tone: "none" };
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: diff === -1 ? "Overdue by 1 day" : `Overdue by ${Math.abs(diff)} days`, tone: "overdue" };
  if (diff === 0) return { label: "Due today", tone: "today" };
  if (diff === 1) return { label: "Due tomorrow", tone: "soon" };
  if (diff <= 7) return { label: `Due in ${diff} days`, tone: "soon" };
  return { label: `Due ${formatDate(value)}`, tone: "later" };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function initials(name: string): string {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.style.pointerEvents = "none";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export async function resizeImageFile(file: File, maxSize = 360): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image. Choose a PNG, JPG or WebP logo.");
  if (file.size > 8 * 1024 * 1024) throw new Error("That image is larger than 8 MB. Choose a smaller logo file.");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("The image could not be decoded."));
    element.src = dataUrl;
  });
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, width, height);
  // PNG keeps transparent logos clean; the canvas is capped at 360px so the
  // data URL stays small enough for localStorage.
  return canvas.toDataURL("image/png");
}

export function composeMessage(parts: { observation: string; hypothesis: string; capability: string; question: string }): string {
  return [parts.observation, parts.hypothesis, parts.capability, parts.question]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

export const CATEGORY_LABEL: Record<"customer" | "peer", string> = {
  customer: "Customer behaviour",
  peer: "Peer & competitor",
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};


export const PROVENANCE_LABEL: Record<Provenance, string> = {
  demo: "Demo · fictional",
  user: "User-supplied",
  public: "Public snapshot",
  clay: "Clay simulation",
};

export const PROVENANCE_DETAIL: Record<Provenance, string> = {
  demo: "Fictional demo signal",
  user: "User-supplied, not independently verified",
  public: "Public page snapshot; not independently audited",
  clay: "Simulated Clay record; synthetic, not real enrichment",
};

export function merchantSourceMeta(merchant: Pick<Merchant, "isDemo" | "recordSource">): {
  label: string;
  short: string;
  tone: "warning" | "outline" | "primary";
} {
  if (merchant.recordSource === "public") return { label: "Public snapshot", short: "Public", tone: "primary" };
  if (merchant.recordSource === "clay_simulated") return { label: "Clay simulation", short: "Clay", tone: "warning" };
  if (merchant.recordSource === "manual") return { label: "Manual record", short: "Manual", tone: "outline" };
  return merchant.isDemo
    ? { label: "Demo · fictional", short: "Demo", tone: "warning" }
    : { label: "Manual record", short: "Manual", tone: "outline" };
}
