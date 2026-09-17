"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import type { NavLink } from "@/data/navigation";
import { POPULAR_QUESTIONS, search, type SearchIndex } from "@/lib/search/query";

/** How long a query must sit unchanged before it counts as a search (typing is not logged). */
const SETTLE_MS = 1200;

let indexPromise: Promise<SearchIndex> | null = null;
const loadIndex = () =>
  (indexPromise ??= fetch("/search-index.json").then((r) => {
    if (!r.ok) throw new Error(`search index ${r.status}`);
    return r.json() as Promise<SearchIndex>;
  }));

export default function SearchClient({ fallbackLinks }: { fallbackLinks: NavLink[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const logged = useRef(new Set<string>());
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadIndex().then(setIndex, () => { indexPromise = null; setFailed(true); });
    if (!params.get("q")) input.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back/forward and header searches change ?q= while this page stays mounted.
  const urlQ = params.get("q") ?? "";
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ);
    // Our own replace() echoes the trimmed query back; keep what the reader is typing.
    if (urlQ !== query.trim()) setQuery(urlQ);
  }

  const trimmed = query.trim();
  const result = useMemo(() => (index && trimmed ? search(index, trimmed) : null), [index, trimmed]);

  useEffect(() => {
    if (!result || !trimmed) return;
    const t = setTimeout(() => {
      const url = `${pathname}?q=${encodeURIComponent(trimmed)}`;
      router.replace(url, { scroll: false });
      const key = trimmed.toLowerCase();
      if (logged.current.has(key)) return;
      logged.current.add(key);
      // Queries with no results are the list of topics readers want and the site lacks.
      track("search", { query: key.slice(0, 100), results: result.docs.length, answers: result.answers.length });
    }, SETTLE_MS);
    return () => clearTimeout(t);
  }, [result, trimmed, pathname, router]);

  const empty = result && result.docs.length === 0 && result.answers.length === 0;

  return (
    <div className="mt-6">
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); input.current?.blur(); }}
      >
        <label htmlFor="search-page-input" className="sr-only">Search guides</label>
        <input
          id="search-page-input"
          ref={input}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. do I need cash?"
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-primary"
        />
      </form>

      {failed && <p className="mt-6 text-text-secondary">Search could not load. Try again, or browse the guides below.</p>}
      {!failed && trimmed && !index && <p className="mt-6 text-text-secondary">Loading…</p>}

      {!trimmed && (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold">What travellers ask most</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_QUESTIONS.map((p) => (
              <li key={p.query}>
                <button
                  type="button"
                  onClick={() => setQuery(p.query)}
                  className="min-h-11 rounded-full border border-border bg-surface px-4 py-2 text-left text-sm hover:border-primary hover:text-primary"
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result && result.answers.length > 0 && (
        <section className="mt-8" aria-labelledby="answers-heading">
          <h2 id="answers-heading" className="font-heading text-lg font-semibold">Quick answers</h2>
          <ul className="mt-3 space-y-3">
            {result.answers.map((a) => (
              <li key={a.href} className="rounded-xl border border-primary/30 bg-surface p-4">
                <p className="font-semibold">{a.q}</p>
                <p className="mt-1 leading-relaxed">{a.a}</p>
                <Link href={a.href} className="mt-2 inline-block text-sm font-medium text-primary underline">
                  From: {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result && result.docs.length > 0 && (
        <section className="mt-8" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="font-heading text-lg font-semibold">
            Guides <span className="font-normal text-text-secondary">({result.docs.length})</span>
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {result.docs.map(({ doc }) => (
              <li key={doc.path} className="py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{doc.label}</p>
                <Link href={doc.path} className="mt-1 block font-heading text-lg font-semibold text-text-primary hover:text-primary">
                  {doc.title}
                </Link>
                <p className="mt-1 line-clamp-3 text-sm text-text-secondary">{doc.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {empty && (
        <section className="mt-8">
          <p>No guide covers “{trimmed}” yet. We read what readers search for when choosing what to write next.</p>
          <p className="mt-4 flex flex-wrap gap-4">
            {fallbackLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-primary underline">{l.label}</Link>
            ))}
          </p>
        </section>
      )}
    </div>
  );
}
