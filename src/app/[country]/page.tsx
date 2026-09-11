import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { countryParams, metadataFor } from "@/lib/content/route-data";
import HubLayout from "@/components/content/HubLayout";

export const dynamicParams = false;
export const generateStaticParams = () => countryParams(getContent());

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const node = getContent().byPath.get(`/${country}`);
  return node ? metadataFor(node) : {};
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}`);
  if (!node || node.kind !== "hub") notFound();
  return <HubLayout hub={node} idx={idx} />;
}
