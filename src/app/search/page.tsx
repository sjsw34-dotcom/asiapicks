import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";
import { NOT_FOUND_LINKS } from "@/data/navigation";

export const metadata: Metadata = {
  title: "Search South Korea travel guides",
  description: "Search AsiaPicks guides and quick answers on South Korea travel: entry rules, money, transport, where to stay and day trips.",
  alternates: { canonical: "/search" },
  // Result pages are thin and endless; keep them out of search engines but let crawlers follow the links.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Search</h1>
      <p className="mt-2 text-text-secondary">Ask a question or type a topic: cash, K-ETA, airport, KTX, where to stay.</p>
      <Suspense fallback={<div className="mt-6 h-12 rounded-xl border border-border" />}>
        <SearchClient fallbackLinks={NOT_FOUND_LINKS} />
      </Suspense>
    </div>
  );
}
