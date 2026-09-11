import type { ContentNode } from "@/lib/content/loader";
import { getCategory, getCity, getCountry } from "@/data/taxonomy";
import { categoryPath, hubPath } from "@/lib/content/paths";

export function breadcrumbsFor(node: ContentNode): { name: string; path: string }[] {
  const items = [{ name: "Home", path: "/" }];
  const country = getCountry(node.country)!;
  if (node.kind === "hub" && !node.city) return [...items, { name: country.name, path: hubPath(node.country) }];
  items.push({ name: country.name, path: hubPath(node.country) });
  if (node.city) items.push({ name: getCity(node.country, node.city)!.name, path: hubPath(node.country, node.city) });
  if (node.kind === "category") items.push({ name: node.fm.title, path: node.path });
  if (node.kind === "article") {
    const level = node.city ? "city" : "country";
    const cat = getCategory(level, node.fm.category)!;
    items.push({ name: cat.label, path: categoryPath(node.country, node.city, node.fm.category) });
    items.push({ name: node.fm.title, path: node.path });
  }
  return items;
}
