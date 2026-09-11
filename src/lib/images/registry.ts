import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const imageSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    src: z.string().startsWith("/images/"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string(),
    decorative: z.boolean().default(false),
    caption: z.string().optional(),
    credit: z.string().min(1),
    license: z.string().min(1),
    sourceUrl: z.url().optional(),
    aiGenerated: z.boolean().default(false),
  })
  .refine((v) => v.decorative || v.alt.trim().length > 0, { message: "alt is required unless decorative", path: ["alt"] });

export type ImageEntry = z.infer<typeof imageSchema>;

const DEFAULT_DIR = path.join(process.cwd(), "src/data/images");
const cache = new Map<string, Map<string, ImageEntry>>();

export function loadImages(dir: string = DEFAULT_DIR): Map<string, ImageEntry> {
  const hit = cache.get(dir);
  if (hit) return hit;
  const map = new Map<string, ImageEntry>();
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const file = path.join(dir, name);
      let json: unknown;
      try {
        json = JSON.parse(fs.readFileSync(file, "utf-8"));
      } catch (err) {
        throw new Error(`Invalid JSON in image entry ${file}: ${(err as Error).message}`);
      }
      const parsed = imageSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error(`Invalid image entry ${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      }
      if (parsed.data.id !== name.replace(/\.json$/, "")) throw new Error(`Image id does not match file name: ${file}`);
      map.set(parsed.data.id, parsed.data);
    }
  }
  cache.set(dir, map);
  return map;
}

export function getImage(id: string): ImageEntry {
  const img = loadImages().get(id);
  if (!img) throw new Error(`Unknown image id: ${id}`);
  return img;
}
