import type { Article, AreaPage, ContentIndex } from "./loader";
import { CITY_CATEGORIES, areasOf, getArea } from "@/data/taxonomy";

/** How many cards a city hub shows per category before handing over to the category page. */
export const HUB_CARDS_PER_CATEGORY = 4;

export type ArticleGroup = { key: string; title: string; href?: string; articles: Article[] };

/**
 * A category's articles split by neighbourhood, named areas first in taxonomy order,
 * then city-wide pieces. Returns one untitled group when there is nothing to split,
 * so a short list never grows headings for one card each.
 */
export function groupByArea(articles: Article[], idx: ContentIndex): ArticleGroup[] {
  const byArea = new Map<string, Article[]>();
  const cityWide: Article[] = [];
  for (const a of articles) {
    if (a.city && a.fm.area) byArea.set(a.fm.area, [...(byArea.get(a.fm.area) ?? []), a]);
    else cityWide.push(a);
  }
  if (byArea.size === 0 || (byArea.size === 1 && cityWide.length === 0)) {
    return [{ key: "all", title: "", articles }];
  }
  const first = articles[0];
  const order = areasOf(first.country, first.city!).map((x) => x.slug);
  const groups: ArticleGroup[] = [...byArea.entries()]
    .map(([slug, list]) => {
      const area = getArea(first.country, first.city!, slug)!;
      const page = idx.areas.find((p) => p.city === first.city && p.area === slug);
      return { key: slug, title: area.name, href: page?.path, articles: list };
    })
    .sort((x, y) => order.indexOf(x.key) - order.indexOf(y.key));
  if (cityWide.length > 0) groups.push({ key: "city-wide", title: "Across the city", articles: cityWide });
  return groups;
}

/** An area page's articles split by category, in the city's category order. */
export function groupByCategory(page: AreaPage): ArticleGroup[] {
  return CITY_CATEGORIES
    .map((c) => ({ key: c.slug, title: c.label, articles: page.articles.filter((a) => a.fm.category === c.slug) }))
    .filter((g) => g.articles.length > 0);
}
