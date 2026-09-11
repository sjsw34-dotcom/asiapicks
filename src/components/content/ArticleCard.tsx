import Link from "next/link";
import type { Article } from "@/lib/content/loader";
import { formatDate } from "@/lib/content/body";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={article.path} className="block rounded-xl border border-border p-5 hover:border-primary">
      <p className="font-heading text-lg font-semibold text-text-primary">{article.fm.title}</p>
      <p className="mt-2 text-sm text-text-secondary">{article.fm.description}</p>
      <p className="mt-3 text-xs text-text-secondary">Updated {formatDate(article.fm.updatedAt)}</p>
    </Link>
  );
}
