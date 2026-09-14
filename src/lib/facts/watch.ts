import type { Fact } from "./registry";

/**
 * Source watch: fetch each registry fact's source and confirm the value we
 * publish still appears on it. A value that has vanished is the cheapest strong
 * signal that an operator changed a fare or a rule; the watcher reports it, a
 * person re-reads the source and edits the registry. It never edits a value
 * itself: a redesigned page or a bad scrape must not rewrite every guide at once.
 */

export type WatchStatus = "found" | "missing" | "unreachable" | "skipped";

export interface WatchResult {
  fact: Fact;
  url: string;
  status: WatchStatus;
  /** What was looked for, for the issue text. */
  expected: string[];
  detail?: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The forms a source may write our value in: English and Korean sites differ. */
export function expectedForms(fact: Fact): string[] {
  if (fact.watch && fact.watch.expect?.length) return fact.watch.expect;
  const v = fact.value;
  if (v.type === "won") {
    const grouped = v.amount.toLocaleString("en-US");
    return grouped === String(v.amount) ? [grouped] : [grouped, String(v.amount)];
  }
  const [y, m, d] = v.date.split("-").map(Number);
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  const month = MONTHS[m - 1];
  return [
    `${d} ${month} ${y}`,
    `${month} ${d}, ${y}`,
    `${month.slice(0, 3)} ${d}, ${y}`,
    `${y}-${mm}-${dd}`,
    `${y}.${mm}.${dd}`,
    `${y}. ${m}. ${d}`,
    `${y}년 ${m}월 ${d}일`,
    `${mm}/${dd}/${y}`,
  ];
}

/** Visible text of an HTML page, whitespace collapsed. */
export function pageText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when any expected form appears as a whole value: 1,550 must not match inside 11,550 or 1,5500. */
export function containsValue(text: string, forms: string[]): boolean {
  return forms.some((f) => new RegExp(`(?<![\\d,.])${escape(f)}(?![\\d,])`).test(text));
}

export const watchUrl = (f: Fact) => (f.watch && f.watch.url) || f.source.url;

export function judge(fact: Fact, text: string | null, error?: string): WatchResult {
  const url = watchUrl(fact);
  const expected = expectedForms(fact);
  if (fact.watch === false) return { fact, url, status: "skipped", expected };
  if (text === null) return { fact, url, status: "unreachable", expected, detail: error };
  return { fact, url, status: containsValue(text, expected) ? "found" : "missing", expected };
}
