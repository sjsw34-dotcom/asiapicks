import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REF = process.env.LEGACY_REF ?? "main";
const git = (cmd: string) => execSync(`git ${cmd}`, { encoding: "utf-8" }).split("\n").map((s) => s.trim()).filter(Boolean);

const paths = new Set<string>([
  "/", "/destinations", "/blog", "/deals", "/saju-travel", "/search", "/about", "/privacy", "/terms",
  "/affiliate-disclosure", "/feed.xml",
  ...["travel-guides", "hotels-stays", "activities-tours", "travel-tips", "saju-travel"].map((c) => `/blog/category/${c}`),
]);

for (const f of git(`ls-tree --name-only ${REF} src/content/blog/`)) {
  if (f.endsWith(".mdx")) paths.add(`/blog/${path.basename(f, ".mdx")}`);
}
for (const f of git(`ls-tree -r --name-only ${REF} src/data/destinations`)) {
  const m = f.match(/src\/data\/destinations\/([^/]+)\/([^/]+)\.json$/);
  if (m) { paths.add(`/destinations/${m[1]}`); paths.add(`/destinations/${m[1]}/${m[2]}`); }
}

const extra = path.join("scripts", "legacy", "gsc-pages.txt");
if (fs.existsSync(extra)) {
  for (const line of fs.readFileSync(extra, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const p = new URL(t, "https://asiapicks.com").pathname.replace(/\/$/, "") || "/";
    paths.add(p);
  }
}

const out = [...paths].sort();
fs.writeFileSync(path.join("src", "data", "legacy-inventory.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(`legacy inventory: ${out.length} paths from ${REF}${fs.existsSync(extra) ? " + gsc-pages.txt" : ""}`);
