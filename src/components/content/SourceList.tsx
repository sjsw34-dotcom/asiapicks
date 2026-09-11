import { formatDate } from "@/lib/content/body";

export default function SourceList({ sources }: { sources: { title: string; url: string; publisher: string; checkedAt: string }[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-6">
      <h2 className="font-heading text-lg font-semibold">Sources</h2>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener" className="underline underline-offset-2">{s.title}</a>
            {" "}({s.publisher}), checked {formatDate(s.checkedAt)}
          </li>
        ))}
      </ul>
    </section>
  );
}
