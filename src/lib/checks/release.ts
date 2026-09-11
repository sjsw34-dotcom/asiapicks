import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { isProviderConfigured, PROVIDER_LABELS, type ProviderId } from "@/lib/affiliates/providers";
import { result } from "./types";

export function releaseCheck(idx: ContentIndex, offers: Map<string, Offer>, env: NodeJS.ProcessEnv, production: boolean) {
  const r = result("release");
  if (!production) return r;
  if (!env.CONTACT_EMAIL?.trim()) r.errors.push("CONTACT_EMAIL is empty; the contact page needs an address in production");
  const used = new Set<ProviderId>();
  for (const a of idx.articles) for (const id of a.fm.offers) { const o = offers.get(id); if (o) used.add(o.provider); }
  for (const o of offers.values()) used.add(o.provider);
  for (const p of used) if (!isProviderConfigured(p, env)) r.warnings.push(`${PROVIDER_LABELS[p]} IDs are missing; its links will not earn commission`);
  return r;
}
