import { formatDate } from "@/lib/content/body";

/**
 * The page's own H2s as jump links, pinned in the margin the reading column
 * does not use. Long guides get a map; the empty column earns its width.
 */
export default function Outline({
  headings,
  checkedAt,
}: {
  headings: { text: string; id: string }[];
  checkedAt?: string;
}) {
  if (headings.length < 2) return null;
  const links = (
    <ul className="mt-3 space-y-1 border-l border-border pl-4 text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`} className="block py-2 text-text-secondary underline-offset-2 hover:text-primary hover:underline lg:py-1">
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <nav aria-label="On this page" className="mt-6 lg:col-start-2 lg:row-start-1 lg:mt-2 lg:self-start lg:sticky lg:top-8">
      <details className="rounded-xl border border-border bg-surface p-4 lg:hidden">
        <summary className="cursor-pointer font-heading text-sm font-semibold">On this page</summary>
        {links}
      </details>
      <div className="hidden lg:block">
        <p className="font-heading text-sm font-semibold">On this page</p>
        {links}
        {checkedAt ? (
          <p className="mt-5 max-w-[28ch] border-l border-border pl-4 text-xs leading-relaxed text-text-secondary">
            Every figure on this page was checked on {formatDate(checkedAt)} against the sources listed at the foot.
          </p>
        ) : null}
      </div>
    </nav>
  );
}

/** Reading column plus outline margin. One spine for every long page on the site. */
export function WithOutline({ children, outline }: { children: React.ReactNode; outline: React.ReactNode }) {
  return (
    <div className="gap-14 lg:grid lg:grid-cols-[minmax(0,68ch)_1fr]">
      {outline}
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{children}</div>
    </div>
  );
}
