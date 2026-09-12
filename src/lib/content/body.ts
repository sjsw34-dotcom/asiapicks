import GithubSlugger from "github-slugger";

export const stripFences = (body: string) => body.replace(/```[\s\S]*?```/g, "");

export const usesAffiliateComponents = (body: string) =>
  /<(Offer|OfferList|ComparisonTable|BookingCTA)\b/.test(stripFences(body));

/** Layout rule shared by articles, hubs, categories and trust pages: show the affiliate disclosure near the top. */
export const needsDisclosure = (body: string, offerIds: readonly string[] = []) =>
  offerIds.length > 0 || usesAffiliateComponents(body);

export const hasMdxH1 = (body: string) => /^#\s+\S/m.test(stripFences(body));

export const bookingCtaCount = (body: string) => (stripFences(body).match(/<BookingCTA\b/g) ?? []).length;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/**
 * The H2 outline of a body, with the ids rehype-slug will put on the rendered
 * headings. Uses the same slugger rehype-slug does, so anchors always match.
 */
export function headings(body: string): { text: string; id: string }[] {
  const slugger = new GithubSlugger();
  const out: { text: string; id: string }[] = [];
  for (const m of stripFences(body).matchAll(/^##[ \t]+(.+?)[ \t]*#*$/gm)) {
    // Drop inline emphasis, code ticks and link syntax from the label.
    const text = m[1]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    if (text) out.push({ text, id: slugger.slug(text) });
  }
  return out;
}
