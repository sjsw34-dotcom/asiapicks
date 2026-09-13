import { execFileSync } from "node:child_process";
import { loadContent, contentToday } from "@/lib/content/loader";
import { affectedUrls, nodesForFiles, releasedOn } from "@/lib/release";

const USAGE = `Usage:
  npx tsx scripts/release.ts due [--date YYYY-MM-DD]    articles going live that day, as URLs to ping
  npx tsx scripts/release.ts changed <base> <head>      live pages changed between two commits, as URLs
  npx tsx scripts/release.ts wait <url> [...urls]       wait until every URL answers 200 (max 20 min)

Prints one URL per line. The GitHub workflow uses these to rebuild on a release
day and send IndexNow only once the new pages are actually live.`;

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function wait(urls: string[]) {
  const deadline = Date.now() + 20 * 60_000;
  const pending = new Set(urls);
  while (pending.size > 0 && Date.now() < deadline) {
    for (const url of [...pending]) {
      const res = await fetch(url, { redirect: "manual", cache: "no-store" }).catch(() => null);
      if (res?.status === 200) pending.delete(url);
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
    if (released.length) console.log(affectedUrls(released).join("\n"));
    return;
  }
  if (mode === "changed" && rest.length >= 2) {
    const files = execFileSync("git", ["diff", "--name-only", rest[0], rest[1], "--", "src/content"], { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean);
    const nodes = nodesForFiles(loadContent({ includeReview: false }), files);
    if (nodes.length) console.log(affectedUrls(nodes).join("\n"));
    return;
  }
  if (mode === "wait" && rest.length > 0) return wait(rest);
  console.error(USAGE);
  process.exit(1);
}

main();
