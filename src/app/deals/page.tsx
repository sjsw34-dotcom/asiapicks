import { generatePageMetadata } from "@/lib/seo";
import { getAgodaSearchLink, getKlookDestinationLink } from "@/lib/affiliates";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Asia Travel Deals & Promotions — Hotels & Activities",
  description:
    "Discover the best Asia travel deals for 2026. Seasonal hotel discounts on Agoda, skip-the-line activity deals on Klook, and curated trip ideas by budget.",
  path: "/deals",
});

const seasonalDeals = [
  {
    id: "spring-japan",
    badge: "Spring 2026",
    badgeColor: "bg-pink-100 text-pink-700",
    title: "Japan Cherry Blossom Season",
    description:
      "March–April is peak sakura season. Book early — hotels near parks sell out months in advance. Kyoto's Maruyama Park and Tokyo's Ueno Park are unmissable.",
    tips: [
      "Book hotels 3–4 months ahead for Kyoto and Tokyo",
      "Weekday visits are significantly less crowded",
      "JR Pass saves money if visiting 3+ cities",
    ],
    destinations: ["tokyo", "osaka"],
    ctaHotel: { label: "Find Hotels in Tokyo", link: getAgodaSearchLink("tokyo") },
    ctaActivity: { label: "Book Sakura Tours", link: getKlookDestinationLink("tokyo") },
    image: "https://images.unsplash.com/photo-1679392673629-cc4edad1cdd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
  },
  {
    id: "summer-korea",
    badge: "Summer 2026",
    badgeColor: "bg-blue-100 text-blue-700",
    title: "Seoul Summer Deals",
    description:
      "June–August brings K-pop festivals, summer sales, and warm evenings in Han River parks. Many hotels offer summer promotional rates.",
    tips: [
      "T-money card for unlimited metro rides",
      "Namdaemun Market opens from 10am daily",
      "Avoid late July–August typhoon season",
    ],
    destinations: ["seoul"],
    ctaHotel: { label: "Find Hotels in Seoul", link: getAgodaSearchLink("seoul") },
    ctaActivity: { label: "Book Seoul Activities", link: getKlookDestinationLink("seoul") },
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800",
  },
  {
    id: "fall-thailand",
    badge: "Oct–Nov 2026",
    badgeColor: "bg-orange-100 text-orange-700",
    title: "Thailand Cool Season Begins",
    description:
      "October marks the start of the best weather in Thailand — lower humidity, less rain, and stunning temple festivals. Prices drop significantly vs. peak December.",
    tips: [
      "Loy Krathong festival in November is magical",
      "Shoulder season = 20–30% cheaper hotels",
      "Perfect time for Chiang Mai trekking",
    ],
    destinations: ["bangkok", "chiang-mai"],
    ctaHotel: { label: "Find Hotels in Bangkok", link: getAgodaSearchLink("bangkok") },
    ctaActivity: { label: "Book Bangkok Activities", link: getKlookDestinationLink("bangkok") },
    image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800",
  },
  {
    id: "winter-vietnam",
    badge: "Dec–Feb 2026",
    badgeColor: "bg-green-100 text-green-700",
    title: "Vietnam Dry Season",
    description:
      "December to February is ideal for southern Vietnam — sunny skies, low humidity, and festive Tet New Year celebrations in late January/February.",
    tips: [
      "Book 6 weeks before Tet — prices spike sharply",
      "Street food tours best in the evening",
      "Mekong Delta day trips from Ho Chi Minh City",
    ],
    destinations: ["ho-chi-minh", "hanoi"],
    ctaHotel: { label: "Find Hotels in Ho Chi Minh City", link: getAgodaSearchLink("ho-chi-minh") },
    ctaActivity: { label: "Book Vietnam Activities", link: getKlookDestinationLink("ho-chi-minh") },
    image: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800",
  },
];

const budgetTips = [
  {
    icon: "🏨",
    title: "Book Early, Save More",
    body: "Agoda's Early Bird deals can save 20–40% on hotels. Best rates are usually 60–90 days in advance.",
  },
  {
    icon: "🎫",
    title: "Bundle Activities",
    body: "Klook city passes bundle transport + attractions into one price — often 30% cheaper than buying separately.",
  },
  {
    icon: "📅",
    title: "Avoid Peak Weeks",
    body: "Chinese New Year, Golden Week Japan (early May), and Christmas–New Year see 2x prices. Shoulder season wins.",
  },
  {
    icon: "✈️",
    title: "Mid-week Flights",
    body: "Tuesday and Wednesday departures are consistently cheaper. Flexible dates on Google Flights reveal the cheapest weeks.",
  },
];

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
          Deals & Seasonal Promotions
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          The right time to visit makes a big difference. Here are the best value windows across Asia for 2026 — with hotel and activity deals curated by our team.
        </p>
      </div>

      {/* Seasonal Deal Cards */}
      <div className="space-y-8 mb-16">
        {seasonalDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div
                className="md:w-72 h-48 md:h-auto shrink-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${deal.image})` }}
              />

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-2 ${deal.badgeColor}`}
                    >
                      {deal.badge}
                    </span>
                    <h2 className="text-xl font-bold font-heading text-text-primary">
                      {deal.title}
                    </h2>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {deal.description}
                </p>

                {/* Tips */}
                <ul className="space-y-1 mb-5">
                  {deal.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={deal.ctaHotel.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    🏨 {deal.ctaHotel.label}
                  </a>
                  <a
                    href={deal.ctaActivity.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    🎫 {deal.ctaActivity.label}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Tips */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading text-text-primary mb-6">
          Universal Money-Saving Tips
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {budgetTips.map((tip) => (
            <div
              key={tip.title}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <span className="text-3xl block mb-3">{tip.icon}</span>
              <h3 className="font-semibold font-heading text-text-primary mb-2">
                {tip.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Browse destinations CTA */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold font-heading text-text-primary mb-2">
          Ready to Plan Your Asia Trip?
        </h3>
        <p className="text-text-secondary mb-6">
          Browse all destinations and build your perfect itinerary.
        </p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Explore All Destinations
        </Link>
      </div>

      {/* Affiliate disclosure note */}
      <p className="mt-8 text-xs text-text-secondary text-center">
        Links to Agoda and Klook are affiliate links. We may earn a small commission at no extra cost to you.{" "}
        <Link href="/affiliate-disclosure" className="underline hover:text-primary">
          Learn more
        </Link>
      </p>
    </div>
  );
}
