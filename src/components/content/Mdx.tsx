import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { MDXComponents } from "mdx/types";
import Figure from "@/components/media/Figure";
import Gallery from "@/components/media/Gallery";
import OfferCard from "@/components/affiliate/OfferCard";
import OfferList from "@/components/affiliate/OfferList";
import ComparisonTable from "@/components/affiliate/ComparisonTable";
import BookingCTA from "@/components/affiliate/BookingCTA";
import Callout from "./Callout";
import QuickFacts from "./QuickFacts";
import Verdict from "./Verdict";

type P = { children?: React.ReactNode };

export default function Mdx({ source, sourceSlug }: { source: string; sourceSlug: string }) {
  const components: MDXComponents = {
    h1: ({ children }: P) => <h2 className="mt-10 mb-4 font-heading text-2xl font-bold">{children}</h2>,
    h2: ({ children, ...rest }: P & { id?: string }) => <h2 {...rest} className="mt-10 mb-4 scroll-mt-20 font-heading text-2xl font-bold">{children}</h2>,
    h3: ({ children, ...rest }: P & { id?: string }) => <h3 {...rest} className="mt-7 mb-3 scroll-mt-20 font-heading text-xl font-semibold">{children}</h3>,
    p: ({ children }: P) => <p className="my-4">{children}</p>,
    ul: ({ children }: P) => <ul className="my-4 ml-5 list-disc space-y-1.5">{children}</ul>,
    ol: ({ children }: P) => <ol className="my-4 ml-5 list-decimal space-y-1.5">{children}</ol>,
    // On a phone, columns keep a readable width and the table scrolls sideways
    // with the row label pinned, instead of squeezing each cell to a word or two.
    table: ({ children }: P) => (
      <div className="my-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm leading-relaxed">{children}</table>
        </div>
        <p className="mt-1.5 text-xs text-text-secondary sm:hidden">Swipe the table sideways to see every column.</p>
      </div>
    ),
    thead: ({ children }: P) => <thead className="bg-surface">{children}</thead>,
    th: ({ children }: P) => <th className="min-w-[9rem] border-b border-border bg-surface px-3 py-2.5 text-left align-bottom font-semibold first:sticky first:left-0 first:z-10 first:min-w-[6.5rem] sm:px-4">{children}</th>,
    td: ({ children }: P) => <td className="min-w-[9rem] border-b border-border px-3 py-2.5 align-top first:sticky first:left-0 first:z-10 first:min-w-[6.5rem] first:bg-background first:font-medium sm:px-4">{children}</td>,
    a: ({ href = "", children }: P & { href?: string }) =>
      href.startsWith("/") ? (
        <Link href={href} className="text-primary underline underline-offset-2">{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener" className="text-primary underline underline-offset-2">{children}</a>
      ),
    Figure,
    Gallery: ({ ids, columns }: { ids: string; columns?: string }) => <Gallery ids={ids} columns={columns} />,
    Callout,
    QuickFacts,
    Verdict,
    Offer: ({ id }: { id: string }) => <OfferCard id={id} sourceSlug={sourceSlug} />,
    OfferList: ({ ids }: { ids: string }) => <OfferList ids={ids} sourceSlug={sourceSlug} />,
    ComparisonTable: ({ ids }: { ids: string }) => <ComparisonTable ids={ids} sourceSlug={sourceSlug} />,
    BookingCTA: ({ id, heading }: { id: string; heading?: string }) => <BookingCTA id={id} heading={heading} sourceSlug={sourceSlug} />,
  };
  return (
    <div className="content-body">
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }} />
    </div>
  );
}
