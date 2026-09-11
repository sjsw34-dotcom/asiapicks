import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("contact");

export default function Page() {
  return <StaticPage slug="contact" />;
}
