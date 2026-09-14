import Link from "next/link";
import type { ArticleGroup } from "@/lib/content/grouping";
import ArticleCard from "./ArticleCard";

/** Card grids under optional group headings. A group with an href links its heading to that page. */
export default function ArticleGroups({ groups }: { groups: ArticleGroup[] }) {
  return (
    <>
      {groups.map((g) => (
        <section key={g.key} className="mt-8">
          {g.title ? (
            <h2 className="font-heading text-xl font-bold">
              {g.href ? <Link href={g.href} className="hover:text-primary">{g.title}</Link> : g.title}
            </h2>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.articles.map((a) => <ArticleCard key={a.path} article={a} />)}
          </div>
        </section>
      ))}
    </>
  );
}
