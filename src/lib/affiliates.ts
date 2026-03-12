import affiliateConfig from "@/data/affiliates.json";

// ─── Agoda (Hotels only) ──────────────────────────────────────────────────────

export function getAgodaSearchLink(citySlug: string): string {
  const { cid, baseUrl, cityIds } = affiliateConfig.agoda;
  const cityId = cityIds[citySlug as keyof typeof cityIds] ?? "";
  return `${baseUrl}?pcs=1&cid=${cid}&city=${cityId}`;
}

export function getAgodaHotelLink(hotelId: string): string {
  const { cid } = affiliateConfig.agoda;
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${cid}&hid=${hotelId}`;
}

// ─── Klook (Activities only) ──────────────────────────────────────────────────

const { aid, affAdid, redirectBase, destinationIds } = affiliateConfig.klook;

function klookRedirect(targetUrl: string): string {
  return `${redirectBase}?aid=${aid}&aff_adid=${affAdid}&k_site=${encodeURIComponent(targetUrl)}`;
}

/** Klook 메인 페이지 (일반 링크, 도시 미지정) */
export function getKlookMainLink(): string {
  return klookRedirect("https://www.klook.com/");
}

/** 도시별 액티비티 목록 페이지 */
export function getKlookDestinationLink(citySlug: string): string {
  const dest = destinationIds[citySlug as keyof typeof destinationIds] ?? citySlug;
  return klookRedirect(`https://www.klook.com/en-US/city/${dest}/`);
}

/** 개별 액티비티 상품 페이지 */
export function getKlookActivityLink(activityId: string): string {
  return klookRedirect(`https://www.klook.com/activity/${activityId}/`);
}

// ─── Sajumuse ─────────────────────────────────────────────────────────────────

export function getSajumuseLink(campaign?: string): string {
  const { baseUrl, ref } = affiliateConfig.sajumuse;
  return `${baseUrl}?ref=${ref}${campaign ? `&utm_campaign=${campaign}` : ""}`;
}
