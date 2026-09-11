import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("privacy");

export default function Page() {
  return <StaticPage slug="privacy" />;
}
