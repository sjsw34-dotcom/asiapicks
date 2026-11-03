import { execFileSync } from "node:child_process";
import { loadContent, contentToday } from "@/lib/content/loader";
import { addedRedirects, affectedUrls, nodesForFiles, releasedOn } from "@/lib/release";
import { LEGACY } from "@/lib/legacy/legacy";
import { absoluteUrl } from "@/lib/site";

const USAGE = `Usage:
  npx tsx scripts/release.ts due [--date YYYY-MM-DD]    articles going live that day, as URLs to ping
  npx tsx scripts/release.ts changed <base> <head>      live pages changed between two commits, plus new 301 sources, as URLs
  npx tsx scripts/release.ts wait <url> [...urls]       wait until every URL answers 200, or 301 for a redirect source (max 20 min)

Prints one URL per line. The GitHub workflow uses these to rebuild on a release
day and send IndexNow only once the new pages are actually live.`;

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const LEGACY_FILE = "src/data/legacy-urls.json";
const redirectTarget = new Map(LEGACY.redirects.map((r) => [absoluteUrl(r.from), absoluteUrl(r.to)]));

async function wait(urls: string[]) {
  const deadline = Date.now() + 20 * 60_000;
  const pending = new Set(urls);
  while (pending.size > 0 && Date.now() < deadline) {
    for (const url of [...pending]) {
      const res = await fetch(url, { redirect: "manual", cache: "no-store" }).catch(() => null);
      // A merged listing is live once it answers 301 to its article.
      const target = redirectTarget.get(url);
      const moved = !!target && res?.status === 301 && new URL(res.headers.get("location") ?? "", url).href === target;
      if (res?.status === 200 || moved) pending.delete(url);
    }
    if (pending.size > 0) await new Promise((r) => setTimeout(r, 20_000));
  }
  if (pending.size > 0) {
    console.error(`Still not live after 20 minutes:\n${[...pending].join("\n")}`);
    process.exit(1);
  }
  console.error(`Live: ${urls.length} URL(s)`);
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === "due") {
    const date = arg("--date") ?? contentToday();
    const idx = loadContent({ includeReview: false, asOf: date });
    const released = releasedOn(idx, date);
    for (const a of released) console.error(`going live ${date}: ${a.path}`);
    if (released.length) console.log(affectedUrls(released, idx).join("\n"));
    return;
  }
  if (mode === "changed" && rest.length >= 2) {
    const files = execFileSync("git", ["diff", "--name-only", rest[0], rest[1], "--", "src/content", "src/data/facts", LEGACY_FILE], { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean);
    const idx = loadContent({ includeReview: false });
    const nodes = nodesForFiles(idx, files);
    const urls = new Set(nodes.length ? affectedUrls(nodes, idx) : []);
    if (files.includes(LEGACY_FILE)) {
      const at = (rev: string) => {
        try {
          return JSON.parse(execFileSync("git", ["show", `${rev}:${LEGACY_FILE}`], { encoding: "utf-8" }));
        } catch {
          return { redirects: [] };
        }
      };
      // Gone prefixes stay 410 (never revived or redirected); only redirect sources are announced.
      for (const r of addedRedirects(at(rest[0]), at(rest[1]))) urls.add(absoluteUrl(r.from));
    }
    if (urls.size) console.log([...urls].join("\n"));
    return;
  }
  if (mode === "wait" && rest.length > 0) return wait(rest);
  console.error(USAGE);
  process.exit(1);
}

main();
