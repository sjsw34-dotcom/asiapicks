export type ProviderId = "viator" | "creatrip" | "tripcom";

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  viator: "Viator",
  creatrip: "Creatrip",
  tripcom: "Trip.com",
};

export const PROVIDER_HOSTS: Record<ProviderId, string[]> = {
  viator: ["www.viator.com", "viator.com"],
  creatrip: ["creatrip.com", "www.creatrip.com"],
  tripcom: ["www.trip.com", "trip.com", "us.trip.com"],
};

const ALL_PROVIDER_HOSTS = Object.values(PROVIDER_HOSTS).flat();

/** True for a provider host or any subdomain of one (e.g. kr.trip.com). */
export const isProviderHost = (host: string) => {
  const h = host.toLowerCase().replace(/\.$/, "");
  return ALL_PROVIDER_HOSTS.some((p) => h === p || h.endsWith(`.${p}`));
};

const v = (env: NodeJS.ProcessEnv, key: string) => env[key]?.trim() || "";

export function isProviderConfigured(p: ProviderId, env: NodeJS.ProcessEnv = process.env): boolean {
  if (p === "viator") return !!(v(env, "VIATOR_PID") && v(env, "VIATOR_MCID"));
  if (p === "creatrip") return !!v(env, "CREATRIP_AFF_CODE");
  return !!(v(env, "TRIPCOM_ALLIANCE_ID") && v(env, "TRIPCOM_SID"));
}

export function buildAffiliateUrl(
  p: ProviderId,
  targetUrl: string,
  sourceSlug: string,
  env: NodeJS.ProcessEnv = process.env,
): { url: string; tracked: boolean } {
  if (!isProviderConfigured(p, env)) return { url: targetUrl, tracked: false };
  const u = new URL(targetUrl);
  if (p === "viator") {
    u.searchParams.set("pid", v(env, "VIATOR_PID"));
    u.searchParams.set("mcid", v(env, "VIATOR_MCID"));
    u.searchParams.set("medium", "link");
    u.searchParams.set("campaign", sourceSlug);
  } else if (p === "creatrip") {
    const code = `AFF-${v(env, "CREATRIP_AFF_CODE")}`;
    u.searchParams.set("utm_source", code);
    u.searchParams.set("aff_id", code);
    u.searchParams.set("utm_campaign", sourceSlug);
  } else {
    u.searchParams.set("Allianceid", v(env, "TRIPCOM_ALLIANCE_ID"));
    u.searchParams.set("SID", v(env, "TRIPCOM_SID"));
    u.searchParams.set("trip_sub1", sourceSlug);
  }
  return { url: u.toString(), tracked: true };
}
