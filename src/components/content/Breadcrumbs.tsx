import Link from "next/link";

export { breadcrumbsFor } from "@/lib/content/breadcrumbs";

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
      <ol className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.path} className="hover:text-primary">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
