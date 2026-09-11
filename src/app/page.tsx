import Link from "next/link";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-bold">{SITE.name}</h1>
      <p className="mt-4 text-text-secondary">{SITE.tagline}</p>
      <Link href="/korea" className="mt-6 inline-block text-primary underline">South Korea travel guide</Link>
    </div>
  );
}
