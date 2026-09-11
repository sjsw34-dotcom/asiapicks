import type { Article } from "@/lib/content/loader";
import ArticleCard from "./ArticleCard";

export default function RelatedGuides({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-bold">Related guides</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => <ArticleCard key={a.path} article={a} />)}
      </div>
    </section>
  );
}
