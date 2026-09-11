import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { result, rel } from "./types";

const DAY = 86_400_000;
const age = (today: string, iso: string) => (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / DAY;

export function factsCheck(idx: ContentIndex, offers: Map<string, Offer>, today: string) {
  const r = result("facts");
  for (const n of [...idx.hubs, ...idx.articles]) {
    for (const s of n.fm.sources) if (age(today, s.checkedAt) > 90) r.warnings.push(`${rel(n.file)}: source "${s.title}" checked ${s.checkedAt} (over 90 days)`);
  }
  for (const o of offers.values()) {
    if (o.priceCheckedAt && age(today, o.priceCheckedAt) > 90) r.warnings.push(`offer "${o.id}": price checked ${o.priceCheckedAt} (over 90 days)`);
  }
  return r;
}
