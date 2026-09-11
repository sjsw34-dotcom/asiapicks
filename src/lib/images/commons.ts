import { imageSchema, type ImageEntry } from "@/lib/images/registry";

const API = "https://commons.wikimedia.org/w/api.php";

// Formats next/image serves well. Commons also holds TIFF, SVG and PDF, which we skip.
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface CommonsExtValue {
  value: string;
}

export interface CommonsImageInfo {
  url: string;
  descriptionurl: string;
  width: number;
  height: number;
  mime: string;
  extmetadata?: Record<string, CommonsExtValue | undefined>;
}

export interface CommonsCandidate {
  title: string;
  fileUrl: string;
  descriptionUrl: string;
  width: number;
  height: number;
  mime: string;
  artist: string;
  license: string;
  /** License permits commercial use and modification (no NC, no ND). */
  free: boolean;
  /** Mime type we can hand to next/image. */
  usable: boolean;
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** Commons returns Artist and Credit as HTML fragments; we store plain text. */
export function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  return text
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Commons reports a license either as a display name ("CC BY-SA 4.0") or as a
 * slug ("cc-by-sa-4.0"). We always store the display form, because the image
 * registry keys its sourceUrl requirement off a leading "CC".
 */
export function normalizeLicense(raw: string): string {
  const s = raw.trim();
  if (/^cc0/i.test(s)) return "CC0";
  const slug = s.match(/^cc-by(-nc)?(-sa|-nd)?-(\d(?:\.\d)?)$/i);
  if (slug) {
    const nc = slug[1] ? "-NC" : "";
    const mod = slug[2] ? slug[2].toUpperCase() : "";
    return `CC BY${nc}${mod} ${slug[3]}`;
  }
  return s;
}

export function isFreeLicense(license: string): boolean {
  const s = license.trim();
  if (!s) return false;
  // NonCommercial and NoDerivatives rule an image out regardless of the rest.
  if (/\bnc\b|noncommercial|\bnd\b|noderiv/i.test(s)) return false;
  return /^(cc0|cc by|public domain|pdm|kogl)/i.test(s);
}

export function isUsableMime(mime: string): boolean {
  return mime in MIME_EXT;
}

export function imageFileName(id: string, mime: string): string {
  const ext = MIME_EXT[mime];
  if (!ext) throw new Error(`Unsupported image type ${mime}`);
  return `${id}.${ext}`;
}

export function parseImageInfo(title: string, info: CommonsImageInfo): CommonsCandidate {
  const ext = info.extmetadata ?? {};
  const artistRaw = ext.Artist?.value ?? ext.Credit?.value ?? "";
  const artist = stripHtml(artistRaw) || "Unknown author";
  const license = normalizeLicense(ext.LicenseShortName?.value ?? ext.License?.value ?? "");
  return {
    title,
    fileUrl: info.url,
    descriptionUrl: info.descriptionurl,
    width: info.width,
    height: info.height,
    mime: info.mime,
    artist,
    license,
    free: isFreeLicense(license),
    usable: isUsableMime(info.mime),
  };
}

export interface EntryInput {
  id: string;
  alt: string;
  caption?: string;
  decorative?: boolean;
}

/**
 * Turn a chosen candidate into a registry entry. Throws rather than writing a
 * half-valid record: everything downstream (build gates, Figure) assumes the
 * registry is already trustworthy.
 */
export function toImageEntry(c: CommonsCandidate, input: EntryInput): ImageEntry {
  if (!c.free) throw new Error(`License "${c.license}" is not free for commercial use and modification: ${c.descriptionUrl}`);
  if (!c.usable) throw new Error(`Unsupported image type ${c.mime}: ${c.descriptionUrl}`);
  const parsed = imageSchema.safeParse({
    id: input.id,
    src: `/images/${imageFileName(input.id, c.mime)}`,
    width: c.width,
    height: c.height,
    alt: input.alt.trim(),
    decorative: input.decorative ?? false,
    caption: input.caption,
    credit: c.artist,
    license: c.license,
    // Always recorded: CC and KOGL both require a link back, and it costs nothing otherwise.
    sourceUrl: c.descriptionUrl,
    aiGenerated: false,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return parsed.data;
}

export function commonsSearchUrl(query: string, limit: number): string {
  const u = new URL(API);
  u.searchParams.set("action", "query");
  u.searchParams.set("format", "json");
  u.searchParams.set("list", "search");
  u.searchParams.set("srnamespace", "6"); // File:
  u.searchParams.set("srsearch", query);
  u.searchParams.set("srlimit", String(limit));
  return u.toString();
}

export function commonsInfoUrl(titles: string[]): string {
  const u = new URL(API);
  u.searchParams.set("action", "query");
  u.searchParams.set("format", "json");
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|size|mime|extmetadata");
  u.searchParams.set("titles", titles.join("|"));
  return u.toString();
}
