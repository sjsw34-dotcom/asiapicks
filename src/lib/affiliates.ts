import affiliateConfig from "@/data/affiliates.json";

export function getAgodaSearchLink(citySlug: string): string {
  const { cid, baseUrl, cityIds } = affiliateConfig.agoda;
  const cityId = cityIds[citySlug as keyof typeof cityIds] ?? "";
  return `${baseUrl}?pcs=1&cid=${cid}&city=${cityId}`;
}

export function getAgodaHotelLink(hotelId: string): string {
  const { cid } = affiliateConfig.agoda;
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${cid}&hid=${hotelId}`;
}

export function getKlookActivityLink(activityId: string): string {
  const { aid, baseUrl } = affiliateConfig.klook;
  return `${baseUrl}${activityId}?aid=${aid}`;
}

export function getKlookDestinationLink(citySlug: string): string {
  const { aid, destinationIds } = affiliateConfig.klook;
  const dest = destinationIds[citySlug as keyof typeof destinationIds] ?? citySlug;
  return `https://www.klook.com/en-US/city/${dest}/?aid=${aid}`;
}

export function getSajumuseLink(campaign?: string): string {
  const { baseUrl, ref } = affiliateConfig.sajumuse;
  return `${baseUrl}?ref=${ref}${campaign ? `&utm_campaign=${campaign}` : ""}`;
}
