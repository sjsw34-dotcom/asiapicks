import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://asiapicks.com";

interface SeoParams {
  title: string;
  description: string;
  path: string;
  image?: string;
  city?: string;
}

// ── Metadata ────────────────────────────────────────────────

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  city,
}: SeoParams): Metadata {
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? getOGImageUrl(title, city);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ── Dynamic OG Image URL ─────────────────────────────────────

export function getOGImageUrl(title: string, city?: string): string {
  const params = new URLSearchParams({ title });
  if (city) params.set("city", city);
  return `${BASE_URL}/api/og?${params.toString()}`;
}

// ── Schema.org Helpers ───────────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Asiapicks",
    url: BASE_URL,
    description:
      "Expert travel guides, hotel recommendations, and activity bookings for Southeast & East Asia.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/destinations?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function touristDestinationSchema(city: {
  name: string;
  country: string;
  description: string;
  heroImage: string;
  quickInfo: { bestSeason: string; avgBudget: string };
  id: string;
  hotels: { name: string; agodaHotelId: string; rating: number; ratingCount?: number }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: city.name,
    description: city.description,
    url: `${BASE_URL}/destinations/${city.country.toLowerCase()}/${city.id}`,
    image: city.heroImage,
    touristType: [
      { "@type": "Audience", audienceType: "Adventure Travelers" },
      { "@type": "Audience", audienceType: "Food Travelers" },
      { "@type": "Audience", audienceType: "Cultural Travelers" },
    ],
    includesAttraction: city.hotels.map((h) => ({
      "@type": "LodgingBusiness",
      name: h.name,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: h.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: h.ratingCount ?? 100,
      },
    })),
    containedInPlace: {
      "@type": "Country",
      name: city.country,
    },
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  image?: string;
  tags: string[];
  readTime: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: post.image ?? getOGImageUrl(post.title),
    keywords: post.tags.join(", "),
    author: {
      "@type": "Organization",
      name: "Asiapicks",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Asiapicks",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/images/og/logo.png` },
    },
    timeRequired: `PT${post.readTime}M`,
  };
}

export function breadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };
}
