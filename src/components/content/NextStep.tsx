import Link from "next/link";
import type { Article } from "@/lib/content/loader";

export default function NextStep({ article }: { article: Article | null }) {
  if (!article) return null;
  return (
    <aside className="mt-12 rounded-xl bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Next step</p>
      <Link href={article.path} className="mt-1 block font-heading text-lg font-semibold text-primary underline-offset-2 hover:underline">
        {article.fm.title}
      </Link>
      <p className="mt-1 text-sm text-text-secondary">{article.fm.description}</p>
    </aside>
  );
}
