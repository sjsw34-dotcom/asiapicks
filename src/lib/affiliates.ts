import affiliateConfig from "@/data/affiliates.json";

// ─── Agoda (Hotels only) ──────────────────────────────────────────────────────
// linkmoa.kr 경유 제휴 링크 (아고다 직접 제휴 대신 사용)

const AGODA_AFFILIATE_URL = "https://linkmoa.kr/click.php?m=agoda&a=A100693729&l=0000";

export function getAgodaSearchLink(_citySlug: string): string {
  return AGODA_AFFILIATE_URL;
}

export function getAgodaHotelLink(_hotelId: string): string {
  return AGODA_AFFILIATE_URL;
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
