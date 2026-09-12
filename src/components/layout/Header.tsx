import Link from "next/link";
import { HEADER_NAV } from "@/data/navigation";
import { SITE } from "@/lib/site";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="font-heading text-2xl font-bold text-primary">{SITE.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {HEADER_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-text-secondary hover:text-primary">{n.label}</Link>
          ))}
        </nav>
        <MobileNav links={HEADER_NAV} />
      </div>
    </header>
  );
}
