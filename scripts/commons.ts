import fs from "node:fs";
import sharp from "sharp";
import path from "node:path";
import {
  commonsSearchUrl,
  commonsInfoUrl,
  parseImageInfo,
  toImageEntry,
  imageFileName,
  targetDimensions,
  type CommonsCandidate,
  type CommonsImageInfo,
} from "@/lib/images/commons";

const IMAGE_DIR = path.join(process.cwd(), "public/images");
const ENTRY_DIR = path.join(process.cwd(), "src/data/images");
const UA = "AsiaPicks/1.0 (https://asiapicks.com; image sourcing)";

const USAGE = `Usage:
  npx tsx scripts/commons.ts search "<query>" [--limit 10]
  npx tsx scripts/commons.ts add "<File:Title.jpg>" <image-id> --alt "<alt text>" [--caption "..."]

search  lists free, usable Commons files for a query so you can pick one.
add     downloads the chosen file and writes its registry entry.`;

async function api<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status} for ${url}`);
  return (await res.json()) as T;
}

interface SearchResponse {
  query?: { search?: { title: string }[] };
}
interface InfoResponse {
  query?: { pages?: Record<string, { title: string; imageinfo?: CommonsImageInfo[] }> };
}

async function candidatesFor(titles: string[]): Promise<CommonsCandidate[]> {
  if (titles.length === 0) return [];
  const data = await api<InfoResponse>(commonsInfoUrl(titles));
  const pages = Object.values(data.query?.pages ?? {});
  const out: CommonsCandidate[] = [];
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (info) out.push(parseImageInfo(p.title, info));
  }
  // Preserve the relevance order the search returned.
  const rank = new Map(titles.map((t, i) => [t, i]));
  return out.sort((a, b) => (rank.get(a.title) ?? 0) - (rank.get(b.title) ?? 0));
}

async function search(query: string, limit: number) {
  const found = await api<SearchResponse>(commonsSearchUrl(query, limit));
  const titles = (found.query?.search ?? []).map((s) => s.title);
  if (titles.length === 0) {
    console.log(`No Commons files for "${query}".`);
    return;
  }
  const all = await candidatesFor(titles);
  const usable = all.filter((c) => c.free && c.usable);
  const skipped = all.length - usable.length;

  if (usable.length === 0) {
    console.log(`${all.length} result(s) for "${query}", none free and web-usable. Try a more specific query.`);
    return;
  }
  console.log(`${usable.length} usable result(s) for "${query}"${skipped > 0 ? ` (${skipped} skipped: non-free or wrong format)` : ""}\n`);
  for (const c of usable) {
    console.log(`  ${c.title}`);
    console.log(`    ${c.width}x${c.height}  ${c.license}  by ${c.artist}`);
    console.log(`    preview: ${c.descriptionUrl}`);
    console.log("");
  }
  console.log(`Pick one, open its preview URL to check it, then:`);
  console.log(`  npx tsx scripts/commons.ts add "${usable[0].title}" <image-id> --alt "<alt text>"`);
}

/** Re-encode at the stored width. Keeps the source format so PNG stays PNG. */
async function resize(input: Buffer, mime: string, width: number): Promise<Buffer> {
  const img = sharp(input).resize({ width, withoutEnlargement: true });
  if (mime === "image/png") return img.png({ compressionLevel: 9 }).toBuffer();
  if (mime === "image/webp") return img.webp({ quality: 82 }).toBuffer();
  return img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

async function add(title: string, id: string, alt: string, caption?: string) {
  const [candidate] = await candidatesFor([title]);
  if (!candidate) throw new Error(`Commons has no file named ${title}`);

  // Validate before downloading anything: throws on non-free, wrong format or bad id/alt.
  toImageEntry(candidate, { id, alt, caption });

  const entryFile = path.join(ENTRY_DIR, `${id}.json`);
  if (fs.existsSync(entryFile)) throw new Error(`Image id "${id}" already exists: ${entryFile}`);

  const res = await fetch(candidate.fileUrl, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${candidate.fileUrl}`);
  const original = Buffer.from(await res.arrayBuffer());

  const dimensions = targetDimensions(candidate.width, candidate.height);
  const bytes = await resize(original, candidate.mime, dimensions.width);
  // Rebuild with the dimensions actually on disk, so next/image is not told a lie.
  const stored = toImageEntry(candidate, { id, alt, caption, dimensions });

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  fs.mkdirSync(ENTRY_DIR, { recursive: true });
  fs.writeFileSync(path.join(IMAGE_DIR, imageFileName(id, candidate.mime)), bytes);
  fs.writeFileSync(entryFile, `${JSON.stringify(stored, null, 2)}\n`);

  const saved = Math.round((1 - bytes.length / original.length) * 100);
  console.log(
    `Added "${id}" (${stored.width}x${stored.height}, ${Math.round(bytes.length / 1024)} KB` +
      (saved > 0 ? `, ${saved}% smaller than the ${candidate.width}x${candidate.height} original` : "") +
      ")",
  );
  console.log(`  ${stored.src}`);
  console.log(`  ${entryFile}`);
  console.log(`  credit: ${stored.credit} (${stored.license})`);
  console.log(`\nUse it in MDX:  <Figure id="${id}" />`);
}

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "search") {
    const query = rest[0];
    if (!query) throw new Error(USAGE);
    await search(query, Number(flag(rest, "limit") ?? 10));
  } else if (cmd === "add") {
    const [title, id] = rest;
    const alt = flag(rest, "alt");
    if (!title || !id || !alt) throw new Error(USAGE);
    await add(title, id, alt, flag(rest, "caption"));
  } else {
    throw new Error(USAGE);
  }
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
