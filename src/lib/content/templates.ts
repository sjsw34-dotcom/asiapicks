/**
 * Article shapes. The template is an editorial instruction first: it decides
 * how a piece is written, and the layout follows it so the page does not put
 * the same furniture around every kind of writing.
 *
 * The voice each one takes is specified in CLAUDE.md under "Templates".
 */
export const TEMPLATES = ["guide", "comparison", "best-of", "itinerary", "where-to-stay", "essay"] as const;

export type Template = (typeof TEMPLATES)[number];

/** Shapes that exist to reach a recommendation, rather than to answer a lookup. */
const VERDICT_FIRST = new Set<Template>(["comparison", "where-to-stay"]);

export function answerLabel(template: Template): string {
  return VERDICT_FIRST.has(template) ? "Our pick" : "Short answer";
}

/**
 * An essay argues rather than answers, so a boxed "Short answer" misrepresents
 * it. Its summary runs as a standfirst under the headline instead.
 */
export function leadsWithStandfirst(template: Template): boolean {
  return template === "essay";
}
