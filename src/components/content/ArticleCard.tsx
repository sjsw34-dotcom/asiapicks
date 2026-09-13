import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/content/loader";
import { formatDate } from "@/lib/content/body";
import { getImage } from "@/lib/images/registry";

/** The thumbnails a set of cards renders, for the page's ImageCredits. */
export function cardImageIds(articles: Article[]): string[] {
  return articles.map((a) => a.fm.featuredImage).filter((id): id is string => !!id);
}

export default function ArticleCard({ article }: { article: Article }) {
  const img = article.fm.featuredImage ? getImage(article.fm.featuredImage) : null;
  return (
    <Link href={article.path} className="group block overflow-hidden rounded-xl border border-border hover:border-primary">
      {img ? (
        <Image
          src={img.src}
          width={img.width}
          height={img.height}
          alt=""
          sizes="(max-width: 640px) 100vw, 600px"
          className="aspect-[2/1] w-full object-cover"
        />
      ) : null}
      <div className="p-5">
        <p className="font-heading text-lg font-semibold text-text-primary group-hover:text-primary">{article.fm.title}</p>
        <p className="mt-2 text-sm text-text-secondary">{article.fm.description}</p>
        <p className="mt-3 text-xs text-text-secondary">Updated {formatDate(article.fm.updatedAt)}</p>
      </div>
    </Link>
  );
}
