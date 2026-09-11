import type { Metadata } from "next";
import { getStaticPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate, needsDisclosure } from "@/lib/content/body";
import { SITE } from "@/lib/site";
import Disclosure from "@/components/affiliate/Disclosure";
import Mdx from "./Mdx";

export function staticPageMetadata(slug: string): Metadata {
  const { fm } = getStaticPage(slug);
  return buildMetadata({ title: fm.title, description: fm.description, path: `/${slug}` });
}

export default function StaticPage({ slug }: { slug: string }) {
  const { fm, body } = getStaticPage(slug);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">{fm.title}</h1>
      <p className="mt-2 text-sm text-text-secondary">Last updated {formatDate(fm.updatedAt)}</p>
      {needsDisclosure(body) ? <Disclosure /> : null}
      <Mdx source={body} sourceSlug={`page-${slug}`} />
      {slug === "contact" ? (
        SITE.contactEmail ? (
          <p className="mt-6 text-lg">Email: <a className="text-primary underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
        ) : (
          <p className="mt-6 text-sm text-text-secondary">CONTACT_EMAIL is not configured in this environment.</p>
        )
      ) : null}
    </div>
  );
}
