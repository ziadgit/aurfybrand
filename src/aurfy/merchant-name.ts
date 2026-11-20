/**
 * Derive a merchant's display name from a fetched public page.
 *
 * Page titles are often generic ("Home") or carry a tagline
 * ("Soylent: Let us take a few things off your plate."), so the raw title is a
 * poor company name. Preference order:
 *   1. the site's declared name (og:site_name / JSON-LD), when not generic;
 *   2. a title segment that matches the domain's brand;
 *   3. a short, non-generic title segment;
 *   4. a name derived from the domain.
 */

const GENERIC_SEGMENTS = new Set([
  "home",
  "homepage",
  "home page",
  "welcome",
  "index",
  "main",
  "official site",
  "official website",
  "website",
  "site",
  "shop",
  "store",
  "online store",
  "online shop",
  "shop online",
  "untitled",
  "page",
  "landing",
  "start",
]);

const TITLE_SEPARATORS = /\s+[|–—\-·•:»]\s+|\s*[|–—·•»]\s*|:\s+/;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function isGenericName(value: string): boolean {
  const cleaned = value.trim().toLowerCase().replace(/[.!]+$/, "");
  return cleaned.length < 2 || GENERIC_SEGMENTS.has(cleaned) || /^(welcome to|home of)\b/.test(cleaned) && cleaned.split(/\s+/).length <= 2;
}

/** "www.poosh.com" -> "poosh"; "shop.dandelionchocolate.co.uk" -> "dandelionchocolate". */
export function brandLabelFromUrl(url: string): string {
  try {
    const host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase();
    const parts = host.replace(/^www\d*\./, "").split(".");
    if (parts.length <= 1) return parts[0] ?? "";
    // Handle two-part public suffixes such as co.uk / com.au.
    const secondLevel = parts[parts.length - 2];
    const label =
      parts.length >= 3 && /^(co|com|net|org|gov|ac|edu)$/.test(secondLevel) ? parts[parts.length - 3] : secondLevel;
    return label ?? "";
  } catch {
    return "";
  }
}

export function nameFromUrl(url: string): string {
  const label = brandLabelFromUrl(url);
  if (!label) return "";
  return label
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function matchesBrand(segment: string, brand: string): boolean {
  const seg = normalize(segment);
  if (!seg || !brand) return false;
  return seg === brand || (seg.length >= 3 && brand.includes(seg)) || (brand.length >= 3 && seg.startsWith(brand) && seg.length <= brand.length + 12);
}

/** Pull the brand out of a single string that may carry a tagline, e.g. "Soylent Let us take…". */
function brandPrefix(value: string, brand: string): string | null {
  if (!brand) return null;
  const words = value.trim().split(/\s+/);
  let built = "";
  for (let i = 0; i < Math.min(words.length, 4); i += 1) {
    built = words.slice(0, i + 1).join(" ");
    if (normalize(built) === brand) return built.replace(/[,:;.!]+$/, "");
  }
  return null;
}

export type NameSource = { title: string; url: string; siteName?: string | null };

export function suggestMerchantName({ title, url, siteName }: NameSource): string {
  const brand = brandLabelFromUrl(url);
  const site = siteName?.trim();
  if (site && !isGenericName(site) && site.length <= 60) return site.slice(0, 80);

  const segments = (title || "")
    .split(TITLE_SEPARATORS)
    .map((segment) => segment.trim().replace(/[.!]+$/, ""))
    .filter((segment) => segment && !isGenericName(segment));

  const branded = segments.find((segment) => matchesBrand(segment, brand));
  if (branded) return branded.slice(0, 80);

  for (const segment of segments) {
    const prefix = brandPrefix(segment, brand);
    if (prefix) return prefix;
  }

  // A short segment is probably a name; a long one is probably a tagline.
  const short = segments.find((segment) => segment.split(/\s+/).length <= 4 && segment.length <= 40);
  if (short && !brand) return short;

  return nameFromUrl(url) || short || segments[0] || "";
}

/**
 * Repair a stored merchant name that was taken verbatim from a page title.
 * Only rewrites names that are generic ("Home") or that start with the domain's
 * brand followed by a tagline. Anything else is left as the user wrote it.
 */
export function repairStoredName(name: string, url: string): string {
  if (!url) return name;
  if (isGenericName(name)) return nameFromUrl(url) || name;
  const brand = brandLabelFromUrl(url);
  const prefix = brandPrefix(name, brand);
  if (prefix && prefix.length < name.trim().length && name.trim().split(/\s+/).length > prefix.split(/\s+/).length + 2) {
    return prefix;
  }
  return name;
}
