import Link from "next/link";
import { CITIES } from "@/data/taxonomy";
import { SITE } from "@/lib/site";

const TRUST = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/how-we-choose", label: "How We Choose Recommendations" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg font-bold text-primary">{SITE.name}</p>
          <p className="mt-2 text-sm text-text-secondary">{SITE.tagline}</p>
        </div>
        <nav aria-label="Destinations">
          <p className="text-sm font-semibold text-text-primary">South Korea</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/korea" className="text-text-secondary hover:text-primary">South Korea travel guide</Link></li>
            {CITIES.filter((c) => c.slug !== "incheon").map((c) => (
              <li key={c.slug}><Link href={`/korea/${c.slug}`} className="text-text-secondary hover:text-primary">{c.name} travel guide</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="About AsiaPicks">
          <p className="text-sm font-semibold text-text-primary">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            {TRUST.map((t) => (
              <li key={t.href}><Link href={t.href} className="text-text-secondary hover:text-primary">{t.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-border px-4 py-6 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {SITE.name}. Some links are affiliate links; we may earn a commission at no extra cost to you.
      </p>
    </footer>
  );
}
