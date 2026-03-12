import { getAgodaSearchLink, getKlookDestinationLink, getSajumuseLink } from "@/lib/affiliates";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";

type CTAVariant = "hotel" | "activity" | "saju";

interface AffiliateCTAProps {
  variant: CTAVariant;
  citySlug?: string;
  campaign?: string;
}

const CONFIG = {
  hotel: {
    bg: "bg-teal-50 border-teal-200",
    iconBg: "bg-primary/10",
    icon: "🏨",
    heading: "Find the best hotel deals on Agoda",
    subtext: "Compare prices across hundreds of hotels — often cheaper than booking direct.",
    btnClass: "bg-primary hover:bg-primary-dark text-white",
    btnLabel: "Search Hotels on Agoda",
    showDisclosure: true,
  },
  activity: {
    bg: "bg-orange-50 border-orange-200",
    iconBg: "bg-secondary/10",
    icon: "🎫",
    heading: "Book skip-the-line tickets on Klook",
    subtext: "Instant confirmation, mobile vouchers, and the best prices on tours & experiences.",
    btnClass: "bg-secondary hover:bg-secondary-dark text-white",
    btnLabel: "Browse Activities on Klook",
    showDisclosure: true,
  },
  saju: {
    bg: "bg-purple-50 border-purple-200",
    iconBg: "bg-accent/10",
    icon: "🔮",
    heading: "Discover your travel destiny",
    subtext: "Based on your Saju birth chart, find out which Asian destination is written in your stars.",
    btnClass: "bg-accent hover:bg-accent-dark text-white",
    btnLabel: "Get Your Saju Travel Reading",
    showDisclosure: false,
  },
};

export default function AffiliateCTA({ variant, citySlug, campaign }: AffiliateCTAProps) {
  const c = CONFIG[variant];

  let href = "#";
  if (variant === "hotel" && citySlug) href = getAgodaSearchLink(citySlug);
  else if (variant === "activity" && citySlug) href = getKlookDestinationLink(citySlug);
  else if (variant === "saju") href = getSajumuseLink(campaign ?? "blog-cta");

  return (
    <aside className={`rounded-xl border p-6 my-8 ${c.bg}`}>
      <div className="flex items-start gap-4">
        <span className={`text-2xl shrink-0 rounded-lg p-2 ${c.iconBg}`} aria-hidden="true">
          {c.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold font-heading text-text-primary">
            {c.heading}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">{c.subtext}</p>
          <div className="mt-4">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${c.btnClass}`}
            >
              {c.btnLabel} →
            </a>
            {c.showDisclosure && <AffiliateDisclosure variant="inline" />}
          </div>
        </div>
      </div>
    </aside>
  );
}
