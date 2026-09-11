import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("editorial-policy");

export default function Page() {
  return <StaticPage slug="editorial-policy" />;
}
