import Link from "next/link";

const footerSections = [
  {
    title: "Destinations",
    links: [
      { href: "/destinations/japan", label: "Japan" },
      { href: "/destinations/thailand", label: "Thailand" },
      { href: "/destinations/korea", label: "South Korea" },
      { href: "/destinations/vietnam", label: "Vietnam" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/blog", label: "Travel Blog" },
      { href: "/deals", label: "Deals & Promos" },
      { href: "/saju-travel", label: "Saju Travel" },
      { href: "/about", label: "About Us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold font-heading text-primary">
              Asiapicks
            </span>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Your trusted guide to the best destinations, hotels, and
              experiences across Asia.
            </p>

          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Asiapicks. All rights
            reserved.
          </p>
          <Link
            href="/affiliate-disclosure"
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            Affiliate Disclosure: We earn commissions from Agoda &amp; Klook at no extra cost to you.
          </Link>
        </div>
      </div>
    </footer>
  );
}
