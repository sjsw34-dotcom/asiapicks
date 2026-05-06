import affiliateConfig from "@/data/affiliates.json";

// ─── Agoda (Hotels only) ──────────────────────────────────────────────────────
// TODO: 직접 Agoda 어필리에이트 승인되면 cid/pcs 파라미터 추가. 지금은 수수료 0 직링크.

const { cityIds: agodaCityIds } = affiliateConfig.agoda;

export function getAgodaSearchLink(citySlug: string): string {
  const cityId = agodaCityIds[citySlug as keyof typeof agodaCityIds];
  return cityId
    ? `https://www.agoda.com/search?city=${cityId}`
    : `https://www.agoda.com/`;
}

export function getAgodaHotelLink(hotelId: string): string {
  return hotelId
    ? `https://www.agoda.com/hotel/${hotelId}.html`
    : `https://www.agoda.com/`;
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

/** 도시별 액티비티 검색 페이지 */
export function getKlookDestinationLink(citySlug: string): string {
  const dest = destinationIds[citySlug as keyof typeof destinationIds] ?? citySlug;
  return klookRedirect(`https://www.klook.com/en-US/search/?query=${encodeURIComponent(dest)}`);
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
