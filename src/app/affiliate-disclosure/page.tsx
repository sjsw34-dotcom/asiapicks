import { generatePageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Affiliate Disclosure — Asiapicks",
  description:
    "Full affiliate disclosure for Asiapicks.com. We earn commissions from Agoda and Klook when you book through our links, at no extra cost to you.",
  path: "/affiliate-disclosure",
});

export default function AffiliateDisclosurePage() {
  const lastUpdated = "March 12, 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary mb-3">
          Affiliate Disclosure
        </h1>
        <p className="text-sm text-text-secondary">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-text-secondary">

        {/* FTC Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 not-prose">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            FTC Required Disclosure
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Asiapicks.com participates in affiliate advertising programs. This means we
            earn advertising fees when you click on links on this site and make a
            qualifying purchase. This is how we fund the site and keep all content free
            for our readers.
          </p>
        </div>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            1. What Is an Affiliate Link?
          </h2>
          <p className="leading-relaxed">
            An affiliate link is a specially tracked URL that tells a merchant (e.g.,
            Agoda or Klook) that a visitor came from our site. When you click one of these
            links and complete a qualifying action — such as booking a hotel or purchasing
            an activity — we receive a small commission from the merchant.
          </p>
          <p className="mt-3 leading-relaxed">
            The price you pay is never affected by whether you use our affiliate link.
            You will not pay more, and in many cases the same rates, promotions, and
            cancellation policies apply whether you book through us or go directly to the
            merchant&apos;s site.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            2. Our Affiliate Partners
          </h2>
          <p className="leading-relaxed mb-4">
            Asiapicks.com currently participates in the following affiliate programs:
          </p>

          <div className="space-y-4 not-prose">
            <div className="border border-border rounded-xl p-5 bg-surface">
              <h3 className="font-semibold text-text-primary mb-1">Agoda</h3>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Program:</strong> Agoda Partner Program (YCS / Affiliate Program)
              </p>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Commission:</strong> Approximately 4–5% of confirmed booking value
              </p>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Used for:</strong> Hotel and accommodation recommendations
                throughout the site
              </p>
              <p className="text-sm text-text-secondary">
                <strong>Identification:</strong> Links to agoda.com containing{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">cid=</code> parameter
                are affiliate links.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-surface">
              <h3 className="font-semibold text-text-primary mb-1">Klook</h3>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Program:</strong> Klook Affiliate Partner Program
              </p>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Commission:</strong> Approximately 2–5% of confirmed booking value
              </p>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Used for:</strong> Activity, tour, and transport pass
                recommendations throughout the site
              </p>
              <p className="text-sm text-text-secondary">
                <strong>Identification:</strong> Links to klook.com containing{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">aid=</code> parameter
                are affiliate links.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-surface">
              <h3 className="font-semibold text-text-primary mb-1">
                Sajumuse.com
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Relationship:</strong> Sister site operated by the same team
              </p>
              <p className="text-sm text-text-secondary mb-2">
                <strong>Used for:</strong> Korean saju (fortune-telling) readings
                referenced in our Saju Travel content
              </p>
              <p className="text-sm text-text-secondary">
                <strong>Identification:</strong> Links to sajumuse.com containing{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">ref=tripmuse-asia</code>{" "}
                indicate traffic from this site.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            3. How This Affects Our Content
          </h2>
          <p className="leading-relaxed">
            We are committed to editorial independence. Affiliate relationships do not
            influence which destinations, hotels, or activities we feature or recommend.
            We only recommend products and services we genuinely believe will benefit
            our readers based on:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>Independent research and publicly available traveler reviews</li>
            <li>Competitive pricing and value for money</li>
            <li>Overall quality and reliability of the merchant</li>
            <li>Relevance to the specific destination and traveler type</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            We do not accept payment from hotels, tour operators, or any other third party
            in exchange for guaranteed placement or positive coverage.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            4. How to Identify Affiliate Links
          </h2>
          <p className="leading-relaxed">
            Affiliate links on Asiapicks.com are clearly marked by:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>
              Buttons labeled &quot;Check Price on Agoda&quot;, &quot;Book on Klook&quot;,
              &quot;Find Hotels&quot;, or &quot;Book Activities&quot;
            </li>
            <li>
              Call-to-action boxes with teal (Agoda) or coral (Klook) coloring
            </li>
            <li>
              All external links carry{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">
                rel=&quot;nofollow&quot;
              </code>{" "}
              as required by Google&apos;s guidelines
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            If you are ever unsure whether a link is an affiliate link, you can hover over
            it to see the full URL. Affiliate links will contain tracking parameters such
            as <code className="bg-gray-100 px-1 rounded text-xs">cid=</code> (Agoda) or{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">aid=</code> (Klook).
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            5. FTC Compliance Statement
          </h2>
          <p className="leading-relaxed">
            In accordance with the United States Federal Trade Commission&apos;s (FTC)
            guidelines on endorsements and testimonials (16 C.F.R. Part 255), and similar
            regulations in the United Kingdom (ASA/CAP), European Union, and Australia
            (ACCC), we disclose our material connections to advertisers and affiliate
            partners.
          </p>
          <p className="mt-3 leading-relaxed">
            This disclosure applies to all content on Asiapicks.com, including blog
            posts, destination guides, hotel reviews, activity recommendations, and any
            other promotional material. It also applies to any social media, email
            newsletter, or other channel operated under the Asiapicks brand.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            6. Earnings Disclaimer
          </h2>
          <p className="leading-relaxed">
            Commission rates and affiliate program terms are subject to change at any
            time by the respective merchants. Asiapicks.com makes no guarantee of income
            or specific results from affiliate partnerships. Revenue from affiliate
            commissions is used to fund site development, content creation, and
            operational costs.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            7. Third-Party Pricing Disclaimer
          </h2>
          <p className="leading-relaxed">
            Hotel rates, activity prices, and availability shown on this site are for
            illustrative purposes only. Prices are sourced from publicly available data
            and may not reflect current rates. Always verify prices directly on Agoda,
            Klook, or the merchant&apos;s official site before booking. Asiapicks.com is
            not responsible for discrepancies between listed and actual prices.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            8. Contact Us
          </h2>
          <p className="leading-relaxed">
            If you have any questions about our affiliate relationships, content policies,
            or this disclosure, please contact us at:
          </p>
          <p className="mt-2 font-medium text-text-primary">
            contact@asiapicks.com
          </p>
        </section>

        {/* Footer nav */}
        <div className="pt-6 border-t border-border not-prose">
          <p className="text-sm text-text-secondary">
            See also:{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
            </Link>
            {" · "}
            <Link href="/about" className="text-primary hover:underline">
              About Asiapicks
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
