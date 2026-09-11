import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { segmentParams, metadataFor } from "@/lib/content/route-data";
import HubLayout from "@/components/content/HubLayout";
import CategoryLayout from "@/components/content/CategoryLayout";
import ArticleLayout from "@/components/content/ArticleLayout";

export const dynamicParams = false;
export const generateStaticParams = () => segmentParams(getContent());

type Props = { params: Promise<{ country: string; segment: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, segment } = await params;
  const node = getContent().byPath.get(`/${country}/${segment}`);
  return node ? metadataFor(node) : {};
}

export default async function SegmentPage({ params }: Props) {
  const { country, segment } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}/${segment}`);
  if (!node) notFound();
  if (node.kind === "hub") return <HubLayout hub={node} idx={idx} />;
  if (node.kind === "category") return <CategoryLayout page={node} />;
  return <ArticleLayout article={node} idx={idx} />;
}
