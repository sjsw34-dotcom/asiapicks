import Link from "next/link";
import { CITIES } from "@/data/taxonomy";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/korea", label: "South Korea" },
  ...CITIES.filter((c) => c.slug !== "incheon").map((c) => ({ href: `/korea/${c.slug}`, label: c.name })),
  { href: "/korea/planning", label: "Plan Your Trip" },
];

export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-2xl font-bold text-primary">{SITE.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-text-secondary hover:text-primary">{n.label}</Link>
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-text-secondary" aria-label="Open menu">Menu</summary>
          <nav aria-label="Mobile" className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-lg">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface">{n.label}</Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
