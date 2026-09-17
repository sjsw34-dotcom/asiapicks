/**
 * Site search, shared by the build (index) and the browser (query). Pure: no
 * Node or React imports, so the client bundle stays small.
 *
 * Travellers ask questions ("do I need cash"), so FAQ answers are searched as
 * their own documents and shown above the article list: the answer is on the
 * results page and the reader need not open a guide to find it.
 */

export type SearchFaq = { q: string; a: string; id: string };
export type SearchDoc = {
  path: string;
  title: string;
  /** "Guide", "Seoul · Day Trips", "Category" … shown above the title. */
  label: string;
  summary: string;
  headings: string[];
  keywords: string[];
  faqs: SearchFaq[];
};
export type SearchIndex = { docs: SearchDoc[] };

export type AnswerHit = { q: string; a: string; href: string; title: string; score: number };
export type DocHit = { doc: SearchDoc; score: number };
export type SearchResult = { terms: string[]; answers: AnswerHit[]; docs: DocHit[] };

/**
 * Words travellers use for the same thing. Each group is searched as one term,
 * so "metro" finds the subway fare guide and "visa" finds the K-ETA guide.
 * Multi-word entries are matched as phrases after normalisation.
 */
export const SYNONYMS: string[][] = [
  ["tmoney", "t money", "transit card", "transport card", "travel card"],
  ["subway", "metro", "underground", "tube"],
  ["ktx", "train", "rail", "korail", "srt", "bullet train"],
  ["k eta", "keta", "eta", "visa", "entry permit", "arrival card", "e arrival"],
  ["esim", "sim", "sim card", "mobile data", "phone plan", "roaming", "wifi", "internet"],
  ["cash", "money", "atm", "won", "krw", "currency"],
  ["card", "credit card", "debit card", "visa card", "mastercard", "payment", "pay"],
  ["tip", "tips", "tipping"],
  ["airport", "incheon", "icn", "gimpo", "arex"],
  ["taxi", "cab", "kakao t", "uber"],
  ["hotel", "hotels", "stay", "accommodation", "where to stay", "hostel", "area to stay"],
  ["map", "maps", "naver map", "kakao map", "google maps", "directions", "navigation"],
  ["itinerary", "itineraries"],
  ["day trip", "day trips", "excursion", "tour", "tours"],
  ["hanbok", "traditional dress", "costume"],
  ["dmz", "demilitarized zone", "north korea", "border"],
  ["chuseok", "holiday", "harvest festival", "public holiday"],
  ["autumn", "fall", "foliage", "leaves"],
  ["food", "eat", "restaurant", "restaurants", "dish"],
  ["seoul"], ["busan", "pusan"], ["jeju", "cheju"], ["gyeongju", "kyongju"],
];

const STOP = new Set([
  "a", "an", "the", "i", "me", "my", "we", "you", "your", "is", "are", "do", "does", "did", "can", "could",
  "should", "to", "in", "on", "at", "of", "for", "from", "and", "or", "it", "be", "how", "what", "where",
  "when", "which", "who", "why", "there", "any", "need", "with", "into", "by", "as", "this", "that",
  "korea", "korean", "south", "use", "get", "go", "much", "many", "will", "would", "have", "has", "about",
  "if", "not", "no", "yes", "there", "still", "really", "worth", "good",
]);

/** Place names narrow a search but do not make a question an answer on their own. */
const PLACES = new Set(["seoul", "busan", "jeju", "gyeongju", "incheon"]);

/** Lower-case, strip accents and punctuation; "T-money" and "tmoney" both become comparable. */
export function normalize(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['‘’`]/g, "")
    // "T-money" is a card, not money: keep it one word so a cash search does not find it.
    .replace(/\bt[\s-]?money\b/g, "tmoney")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const GROUPS = SYNONYMS.map((g) => g.map(normalize));

/** A light stem so "fares"/"fare" and "tours"/"tour" meet. */
const stem = (w: string) => (w.length > 4 && w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

/**
 * Query terms, each a list of alternatives. Synonym phrases are taken first so
 * "credit card" is one term, not "credit" + "card".
 */
export function parseQuery(query: string): string[][] {
  let rest = ` ${normalize(query)} `;
  const terms: string[][] = [];
  const phrases = GROUPS.flatMap((g) => g.filter((p) => p.includes(" ")).map((p) => ({ p, g })))
    .sort((x, y) => y.p.length - x.p.length);
  for (const { p, g } of phrases) {
    if (rest.includes(` ${p} `)) {
      terms.push(g);
      rest = rest.replace(` ${p} `, " ");
    }
  }
  for (const w of rest.split(" ").filter((x) => x && !STOP.has(x))) {
    const g = GROUPS.find((grp) => grp.includes(w) || grp.includes(stem(w)));
    terms.push(g ?? [w]);
  }
  return terms;
}

const hasWord = (text: string, word: string) => {
  if (word.includes(" ")) return ` ${text} `.includes(` ${word} `);
  const s = stem(word);
  return text.split(" ").some((t) => t === word || stem(t) === s || (word.length >= 4 && t.startsWith(word)));
};

const termIn = (text: string, alts: string[]) => alts.some((w) => hasWord(text, w));

type Prepared = { doc: SearchDoc; title: string; summary: string; headings: string; keywords: string; faqs: { faq: SearchFaq; q: string; a: string }[] };

const prepared = new WeakMap<SearchIndex, Prepared[]>();
function prepare(index: SearchIndex): Prepared[] {
  let p = prepared.get(index);
  if (!p) {
    p = index.docs.map((doc) => ({
      doc,
      title: normalize(doc.title),
      summary: normalize(doc.summary),
      headings: normalize(doc.headings.join(" ")),
      keywords: normalize(doc.keywords.join(" ")),
      faqs: doc.faqs.map((faq) => ({ faq, q: normalize(faq.q), a: normalize(faq.a) })),
    }));
    prepared.set(index, p);
  }
  return p;
}

/**
 * Results match every term when any page does, so "cash airport" does not
 * return every page about cash; otherwise the pages matching the most terms. Fields are weighted: title and keywords
 * beat headings, which beat the summary and FAQ text.
 */
export function search(index: SearchIndex, query: string, limits = { answers: 3, docs: 20 }): SearchResult {
  const terms = parseQuery(query);
  const shown = terms.map((t) => t[0]);
  if (terms.length === 0) return { terms: shown, answers: [], docs: [] };

  const docs: (DocHit & { matched: number })[] = [];
  const answers: (AnswerHit & { matched: number })[] = [];
  const topical = terms.filter((alts) => !alts.some((w) => PLACES.has(w)));
  for (const p of prepare(index)) {
    let score = 0;
    let matched = 0;
    for (const alts of terms) {
      let s = 0;
      if (termIn(p.title, alts)) s += 10;
      if (termIn(p.keywords, alts)) s += 6;
      if (termIn(p.headings, alts)) s += 4;
      if (termIn(p.summary, alts)) s += 3;
      if (p.faqs.some((f) => termIn(f.q, alts))) s += 3;
      else if (p.faqs.some((f) => termIn(f.a, alts))) s += 1;
      if (s > 0) matched++;
      score += s;
    }
    if (matched > 0) docs.push({ doc: p.doc, score, matched });

    for (const f of p.faqs) {
      let fs = 0;
      let fm = 0;
      for (const alts of terms) {
        const inQ = termIn(f.q, alts);
        const inA = termIn(f.a, alts);
        if (inQ || inA) fm++;
        fs += (inQ ? 4 : 0) + (inA ? 1 : 0);
      }
      // A question counts as an answer only when the question itself names a topic from the query.
      const aboutIt = (topical.length > 0 ? topical : terms).some((alts) => termIn(f.q, alts));
      if (fm > 0 && aboutIt) {
        answers.push({ q: f.faq.q, a: f.faq.a, href: `${p.doc.path}#${f.faq.id}`, title: p.doc.title, score: fs + score / 10, matched: fm });
      }
    }
  }
  // Prefer results that match every term; if none do, fall back to those matching the most.
  const best = (xs: { matched: number }[]) => Math.max(0, ...xs.map((x) => x.matched));
  const need = Math.min(terms.length, best(docs));
  const needA = Math.max(need, Math.min(terms.length, best(answers)));
  const keptDocs = docs.filter((d) => d.matched >= need).map(({ doc, score }) => ({ doc, score }));
  const keptAnswers = answers.filter((a) => a.matched >= needA && needA > 0).map(({ q, a, href, title, score }) => ({ q, a, href, title, score }));
  keptDocs.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  keptAnswers.sort((a, b) => b.score - a.score || a.q.localeCompare(b.q));
  // The same question can sit on a hub and a guide; show it once.
  const seen = new Set<string>();
  const uniqueAnswers = keptAnswers.filter((a) => {
    const k = normalize(a.q);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { terms: shown, answers: uniqueAnswers.slice(0, limits.answers), docs: keptDocs.slice(0, limits.docs) };
}

/** Anchor id for an FAQ question, shared by the FAQ component and the index. */
export function faqId(q: string): string {
  return `faq-${normalize(q).split(" ").slice(0, 8).join("-")}`;
}

/** Questions shown before the reader types; each one runs a search. */
export const POPULAR_QUESTIONS: { label: string; query: string }[] = [
  { label: "Do I need a K-ETA or arrival card?", query: "k-eta arrival card" },
  { label: "Do I need cash in Korea?", query: "cash" },
  { label: "Do you tip in Korea?", query: "tipping" },
  { label: "Can I use my credit card?", query: "credit card" },
  { label: "T-money, WOWPASS or Climate Card?", query: "tmoney" },
  { label: "How do I get from Incheon Airport to Seoul?", query: "airport seoul" },
  { label: "How much is the Seoul subway?", query: "subway fare" },
  { label: "Which eSIM should I buy?", query: "esim" },
  { label: "How do I book the KTX?", query: "ktx" },
  { label: "Where should I stay in Seoul?", query: "where to stay seoul" },
  { label: "Does Google Maps work in Korea?", query: "google maps" },
];
