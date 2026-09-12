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
  return (
    <nav aria-label="On this page" className="mt-12 lg:mt-2">
      <div className="lg:sticky lg:top-8">
        <p className="font-heading text-sm font-semibold">On this page</p>
        <ul className="mt-3 space-y-2 border-l border-border pl-4 text-sm">
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} className="text-text-secondary underline-offset-2 hover:text-primary hover:underline">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
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
      <div className="min-w-0">{children}</div>
      {outline}
    </div>
  );
}
