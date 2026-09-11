import Link from "next/link";
import { FOOTER_DESTINATIONS, FOOTER_TRUST } from "@/data/navigation";
import { SITE } from "@/lib/site";

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
            {FOOTER_DESTINATIONS.map((d) => (
              <li key={d.href}><Link href={d.href} className="text-text-secondary hover:text-primary">{d.label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="About AsiaPicks">
          <p className="text-sm font-semibold text-text-primary">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_TRUST.map((t) => (
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
