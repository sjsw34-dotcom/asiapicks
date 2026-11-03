import fs from "node:fs";
import path from "node:path";
import { result, rel } from "./types";

/** Where text that reaches the screen lives: content, data (alt text, captions, offers, nav) and page code. */
export const DISPLAY_DIRS = ["src/content", "src/data", "src/components", "src/app"];

// House style: no em dash, no en dash, no double hyphen standing in for a dash. Ranges read "3 to 5".
const DASHES = /[\u2013\u2014]|(?<=[\p{L}\p{N}] ?)--(?= ?[\p{L}\p{N}])/u;

function files(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(mdx|json|tsx?|css)$/.test(e.name) ? [p] : [];
  });
}

export function typographyCheck(dirs: string[] = DISPLAY_DIRS.map((d) => path.join(process.cwd(), d))) {
  const r = result("typography");
  for (const file of dirs.flatMap(files)) {
    fs.readFileSync(file, "utf-8").split("\n").forEach((line, i) => {
      // URLs may contain "--" (percent-encoded slugs); only prose counts.
      const prose = line.replace(/https?:\/\/\S+/g, "");
      if (DASHES.test(prose)) r.errors.push(`${rel(file)}:${i + 1}: em dash, en dash or "--" in displayed text; use a comma, colon or "to"`);
    });
  }
  return r;
}
