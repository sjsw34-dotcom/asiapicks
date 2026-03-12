"use client";

import Link from "next/link";

interface CategoryFilterProps {
  categories: { id: string; label: string }[];
  activeCategory?: string;
}

export default function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-primary text-white"
            : "border border-border text-text-secondary hover:border-primary hover:text-primary bg-white"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/blog/category/${cat.id}`}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat.id
              ? "bg-primary text-white"
              : "border border-border text-text-secondary hover:border-primary hover:text-primary bg-white"
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
