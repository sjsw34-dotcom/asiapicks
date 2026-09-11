import { SITE, absoluteUrl } from "@/lib/site";
import { getEditor } from "@/data/editors";
import { CITIES, COUNTRIES, getCity, getCountry } from "@/data/taxonomy";
import type { Article, Hub } from "@/lib/content/loader";

const ORG_ID = `${SITE.baseUrl}/#organization`;
const SITE_ID = `${SITE.baseUrl}/#website`;

function knowsAboutTopics(): string[] {
  const topics: string[] = [];
  for (const country of COUNTRIES) {
    topics.push(`${country.name} travel`);
    for (const city of CITIES.filter((c) => c.country === country.slug)) {
      topics.push(`${city.name} travel`);
    }
  }
  return topics;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.baseUrl,
    logo: absoluteUrl("/icon"),
    description: SITE.description,
    knowsAbout: knowsAboutTopics(),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE.name,
    url: SITE.baseUrl,
    description: SITE.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

function authorNode(editorId: string) {
  const e = getEditor(editorId);
  return { "@type": e.kind, name: e.name, url: e.url };
}

function placeNode(country: string, city: string | null) {
  const c = getCountry(country);
  const ci = city ? getCity(country, city) : undefined;
  return ci
    ? { "@type": "TouristDestination", name: ci.name, containedInPlace: { "@type": "Country", name: c?.name } }
    : { "@type": "Country", name: c?.name };
}

export function articleSchema(a: Article, imageUrl?: string) {
  const url = absoluteUrl(a.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.fm.title,
    description: a.fm.description,
    url,
    mainEntityOfPage: url,
    datePublished: a.fm.publishedAt,
    dateModified: a.fm.updatedAt,
    author: authorNode(a.fm.author),
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    ...(imageUrl ? { image: [imageUrl] } : {}),
    about: placeNode(a.country, a.city),
  };
}

export function destinationSchema(h: Hub) {
  const c = getCountry(h.country);
  const ci = h.city ? getCity(h.country, h.city) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": ci ? "TouristDestination" : "Country",
    name: ci?.name ?? c?.name,
    description: h.fm.description,
    url: absoluteUrl(h.path),
    ...(ci ? { containedInPlace: { "@type": "Country", name: c?.name } } : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function profilePageSchema(editorId: string) {
  const e = getEditor(editorId);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": e.kind, name: e.name, url: e.url, description: e.bio },
  };
}

export function jsonLdString(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
