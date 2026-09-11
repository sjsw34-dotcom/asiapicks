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
