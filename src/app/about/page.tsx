import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("about");

export default function Page() {
  return <StaticPage slug="about" />;
}
