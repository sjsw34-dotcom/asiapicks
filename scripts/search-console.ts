import crypto from "node:crypto";
import { loadContent, contentToday } from "@/lib/content/loader";
import { absoluteUrl, SITE } from "@/lib/site";

const USAGE = `Usage (needs GOOGLE_SERVICE_ACCOUNT_JSON, the shared indexer service account):
  npx tsx scripts/search-console.ts report [--days 28] [--markdown]   clicks and impressions by page and query
  npx tsx scripts/search-console.ts inspect [--markdown]              Google index status of every live article
  npx tsx scripts/search-console.ts sitemap                           submit /sitemap.xml

The service account must be a user (Full or Owner) on the asiapicks.com property.
Reads: Full or Restricted is enough. Sitemap submit: Full or Owner.`;

type ServiceAccount = { client_email: string; private_key: string };

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

async function accessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signature = crypto.createSign("RSA-SHA256").update(`${header}.${claims}`).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claims}.${signature}` }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function api<T>(token: string, url: string, body?: unknown, method = body ? "POST" : "GET"): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/** The Domain property if the account can see it, else the URL-prefix property. */
async function siteProperty(token: string): Promise<string> {
  const host = new URL(SITE.baseUrl).host;
  const { siteEntry = [] } = await api<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
    token, "https://www.googleapis.com/webmasters/v3/sites",
  );
  const usable = siteEntry.filter((s) => s.permissionLevel !== "siteUnverifiedUser");
  const match = usable.find((s) => s.siteUrl === `sc-domain:${host}`) ?? usable.find((s) => s.siteUrl === `${SITE.baseUrl}/`);
  if (!match) {
    const seen = siteEntry.map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(", ") || "none";
    throw new Error(`The service account has no access to ${host} in Search Console. Properties it can see: ${seen}. Add it as a user on the asiapicks.com property.`);
  }
  return match.siteUrl;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const markdown = process.argv.includes("--markdown");

function table(head: string[], rows: (string | number)[][]): string {
  if (!markdown) return [head.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function report(token: string, site: string) {
  const days = Number(arg("--days") ?? 28);
  // Search Console data lags about three days.
  const range = { startDate: daysAgo(days + 3), endDate: daysAgo(3) };
  const query = (dimension: string) => api<{ rows?: Row[] }>(
    token,
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    { ...range, dimensions: [dimension], rowLimit: 25 },
  );
  const [pages, queries] = await Promise.all([query("page"), query("query")]);
  const fmt = (rows: Row[] = []) => rows.map((r) => [r.keys[0].replace(SITE.baseUrl, "") || "/", r.clicks, r.impressions, `${(r.ctr * 100).toFixed(1)}%`, r.position.toFixed(1)]);
  console.log(`${markdown ? "## " : ""}Search performance ${range.startDate} to ${range.endDate} (${site})\n`);
  console.log(`${markdown ? "### " : ""}Top pages\n`);
  console.log(pages.rows?.length ? table(["page", "clicks", "impressions", "ctr", "position"], fmt(pages.rows)) : "No impressions yet.");
  console.log(`\n${markdown ? "### " : ""}Top queries\n`);
  console.log(queries.rows?.length ? table(["query", "clicks", "impressions", "ctr", "position"], fmt(queries.rows)) : "No impressions yet.");
}

async function inspect(token: string, site: string) {
  const idx = loadContent({ includeReview: false, asOf: contentToday() });
  const rows: string[][] = [];
  for (const a of [...idx.articles].sort((x, y) => y.fm.publishedAt.localeCompare(x.fm.publishedAt))) {
    const url = absoluteUrl(a.path);
    const r = await api<{ inspectionResult?: { indexStatusResult?: { coverageState?: string; lastCrawlTime?: string } } }>(
      token, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { inspectionUrl: url, siteUrl: site },
    );
    const s = r.inspectionResult?.indexStatusResult;
    rows.push([a.path, a.fm.publishedAt, s?.coverageState ?? "unknown", s?.lastCrawlTime?.slice(0, 10) ?? "-"]);
  }
  const indexed = rows.filter((r) => /indexed/i.test(r[2]) && !/not indexed/i.test(r[2])).length;
  console.log(`${markdown ? "## " : ""}Index status: ${indexed} of ${rows.length} live articles indexed\n`);
  console.log(table(["article", "published", "coverage", "last crawl"], rows));
}

async function sitemap(token: string, site: string) {
  const feed = absoluteUrl("/sitemap.xml");
  await api(token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(feed)}`, undefined, "PUT");
  console.log(`Submitted ${feed} to ${site}`);
}

async function main() {
  const mode = process.argv[2];
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!mode || !["report", "inspect", "sitemap"].includes(mode)) {
    console.error(USAGE);
    process.exit(1);
  }
  if (!raw) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.\n\n" + USAGE);
    process.exit(1);
  }
  const token = await accessToken(JSON.parse(raw) as ServiceAccount);
  const site = await siteProperty(token);
  if (mode === "report") await report(token, site);
  if (mode === "inspect") await inspect(token, site);
  if (mode === "sitemap") await sitemap(token, site);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
