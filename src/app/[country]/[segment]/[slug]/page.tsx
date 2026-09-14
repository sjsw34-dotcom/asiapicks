import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { slugParams, metadataFor } from "@/lib/content/route-data";
import CategoryLayout from "@/components/content/CategoryLayout";
import AreaLayout from "@/components/content/AreaLayout";
import ArticleLayout from "@/components/content/ArticleLayout";

export const dynamicParams = false;
export const generateStaticParams = () => slugParams(getContent());

type Props = { params: Promise<{ country: string; segment: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, segment, slug } = await params;
  const node = getContent().byPath.get(`/${country}/${segment}/${slug}`);
  return node ? metadataFor(node) : {};
}

export default async function SlugPage({ params }: Props) {
  const { country, segment, slug } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}/${segment}/${slug}`);
  if (!node || node.kind === "hub") notFound();
  if (node.kind === "category") return <CategoryLayout page={node} idx={idx} />;
  if (node.kind === "area") return <AreaLayout page={node} idx={idx} />;
  return <ArticleLayout article={node} idx={idx} />;
}
