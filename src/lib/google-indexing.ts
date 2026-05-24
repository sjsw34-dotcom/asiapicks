/**
 * Google Indexing API + Search Console API utility.
 *
 * Setup (one-time):
 *  1. Google Cloud Console → enable "Web Search Indexing API" + "Google Search Console API"
 *  2. Create a Service Account → download JSON key
 *  3. Google Search Console → asiapicks.com property → Settings → Users
 *     → add the service account email as Owner
 *  4. Set GOOGLE_SERVICE_ACCOUNT_JSON env var (or GitHub secret) to the full JSON key content
 *
 * Sister project (sajumuse) uses the same pattern; the service account can be
 * reused as long as it is granted Owner on the asiapicks Search Console property.
 */

import { google } from "googleapis";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://asiapicks.com"
).replace(/\/$/, "");

function getAuth(scopes: string[]) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  const credentials = JSON.parse(raw) as Record<string, unknown>;
  return new google.auth.GoogleAuth({ credentials, scopes });
}

/** Notify Google via Indexing API (URL_UPDATED). */
export async function notifyGoogleIndexing(pageUrl: string): Promise<boolean> {
  const auth = getAuth(["https://www.googleapis.com/auth/indexing"]);
  if (!auth) {
    console.warn("[google-indexing] GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping");
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indexing = google.indexing({ version: "v3", auth: auth as any });

    await indexing.urlNotifications.publish({
      requestBody: { url: pageUrl, type: "URL_UPDATED" },
    });

    console.log("[google-indexing] Submitted:", pageUrl);
    return true;
  } catch (err) {
    console.error("[google-indexing] Failed:", err);
    return false;
  }
}

/** Request inspection via Search Console API. */
export async function requestSearchConsoleIndexing(
  pageUrl: string
): Promise<boolean> {
  const auth = getAuth(["https://www.googleapis.com/auth/webmasters"]);
  if (!auth) {
    console.warn("[search-console] GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping");
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchconsole = google.searchconsole({ version: "v1", auth: auth as any });

    await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: pageUrl,
        siteUrl: BASE_URL,
      },
    });

    console.log("[search-console] Inspection requested:", pageUrl);
    return true;
  } catch (err) {
    console.error("[search-console] Inspection failed:", err);
    return false;
  }
}

/** Combined: Indexing API + Search Console inspection. */
export async function requestIndexing(pageUrl: string): Promise<void> {
  const results = await Promise.allSettled([
    notifyGoogleIndexing(pageUrl),
    requestSearchConsoleIndexing(pageUrl),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[indexing] Unexpected rejection:", r.reason);
    }
  }
}
