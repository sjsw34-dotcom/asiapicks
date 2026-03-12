"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CityData } from "@/types/destination";
import type { UnifiedPost } from "@/lib/blog";

interface Props {
  cities: CityData[];
  posts: UnifiedPost[];
}

export default function SearchClient({ cities, posts }: Props) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const matchedCities = useMemo(() => {
    if (!q) return [];
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.themes.some((t) => t.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q)
    );
  }, [cities, q]);

  const matchedPosts = useMemo(() => {
    if (!q) return [];
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.country ?? "").toLowerCase().includes(q)
    );
  }, [posts, q]);

  const totalResults = matchedCities.length + matchedPosts.length;

  return (
    <div>
      {/* Search Input */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, cities, travel tips..."
          autoFocus
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border focus:border-primary focus:outline-none text-text-primary text-lg bg-white shadow-sm transition-colors"
        />
      </div>

      {/* Empty state */}
      {!q && (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-lg font-medium text-text-primary mb-2">
            Search Asia Travel
          </p>
          <p className="text-sm">
            Try &quot;Tokyo&quot;, &quot;beach&quot;, &quot;budget hotels&quot;, or &quot;street food&quot;
          </p>
        </div>
      )}

      {/* No results */}
      {q && totalResults === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-lg font-medium text-text-primary mb-2">
            No results for &quot;{query}&quot;
          </p>
          <p className="text-sm">
            Try a different keyword, or{" "}
            <Link href="/destinations" className="text-primary hover:underline">
              browse all destinations
            </Link>
          </p>
        </div>
      )}

      {/* Results */}
      {q && totalResults > 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-6">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>

          {/* Destinations */}
          {matchedCities.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold font-heading text-text-primary mb-4 flex items-center gap-2">
                <span className="text-primary">📍</span> Destinations
                <span className="text-sm font-normal text-text-secondary">
                  ({matchedCities.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/destinations/${city.country.toLowerCase()}/${city.id}`}
                    className="flex items-center gap-4 bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-primary transition-all group"
                  >
                    <span className="text-3xl shrink-0">{city.flag}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                        {city.name}
                      </p>
                      <p className="text-xs text-text-secondary">{city.country}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {city.themes.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-xs bg-surface border border-border px-1.5 py-0.5 rounded-full capitalize"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Blog Posts */}
          {matchedPosts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold font-heading text-text-primary mb-4 flex items-center gap-2">
                <span className="text-secondary">📝</span> Blog Posts
                <span className="text-sm font-normal text-text-secondary">
                  ({matchedPosts.length})
                </span>
              </h2>
              <div className="space-y-3">
                {matchedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="flex items-start gap-4 bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-secondary transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                        {post.category.replace(/-/g, " ")}
                      </span>
                      <p className="font-semibold text-text-primary group-hover:text-secondary transition-colors mt-0.5 line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-sm text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary shrink-0 mt-1">
                      {post.readTime} min
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
