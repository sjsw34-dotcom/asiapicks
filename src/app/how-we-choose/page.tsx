import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("how-we-choose");

export default function Page() {
  return <StaticPage slug="how-we-choose" />;
}
