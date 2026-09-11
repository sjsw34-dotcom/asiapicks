import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

export function ogImageUrl(title: string, eyebrow?: string): string {
  const p = new URLSearchParams({ title });
  if (eyebrow) p.set("eyebrow", eyebrow);
  return absoluteUrl(`/api/og?${p.toString()}`);
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.imageUrl ?? ogImageUrl(input.title);
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      ...(input.type === "article" ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
  };
}
