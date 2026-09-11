import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PROVIDER_HOSTS, type ProviderId } from "./providers";

export const offerSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    provider: z.enum(["viator", "creatrip", "tripcom"]),
    kind: z.enum(["tour", "experience", "hotel", "ticket", "transfer", "rail"]),
    title: z.string().min(1),
    summary: z.string().min(1),
    priceText: z.string().optional(),
    priceCheckedAt: z.iso.date().optional(),
    image: z.string().optional(),
    targetUrl: z.url(),
    destination: z.string().regex(/^[a-z]+(\/[a-z-]+)?$/),
    tags: z.array(z.string()).default([]),
  })
  .refine((o) => {
    try {
      return PROVIDER_HOSTS[o.provider as ProviderId].includes(new URL(o.targetUrl).host);
    } catch {
      return false;
    }
  }, {
    message: "targetUrl host does not belong to provider", path: ["targetUrl"],
  })
  .refine((o) => !o.priceText || !!o.priceCheckedAt, {
    message: "priceText requires priceCheckedAt", path: ["priceCheckedAt"],
  });

export type Offer = z.infer<typeof offerSchema>;

const DEFAULT_DIR = path.join(process.cwd(), "src/data/offers");
const cache = new Map<string, Map<string, Offer>>();

export function loadOffers(dir: string = DEFAULT_DIR): Map<string, Offer> {
  const hit = cache.get(dir);
  if (hit) return hit;
  const map = new Map<string, Offer>();
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const file = path.join(dir, name);
      let json: unknown;
      try {
        json = JSON.parse(fs.readFileSync(file, "utf-8"));
      } catch (err) {
        throw new Error(`Invalid JSON in offer ${file}: ${(err as Error).message}`);
      }
      const parsed = offerSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error(`Invalid offer ${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      }
      if (parsed.data.id !== name.replace(/\.json$/, "")) throw new Error(`Offer id does not match file name: ${file}`);
      map.set(parsed.data.id, parsed.data);
    }
  }
  cache.set(dir, map);
  return map;
}

export function getOffer(id: string): Offer {
  const offer = loadOffers().get(id);
  if (!offer) throw new Error(`Unknown offer id: ${id}`);
  return offer;
}

export const parseIdList = (value: string): string[] =>
  value.split(",").map((s) => s.trim()).filter(Boolean);
