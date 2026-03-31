import { generatePageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Terms of Use — Asiapicks",
  description:
    "Terms and conditions for using Asiapicks.com. Read our terms of use covering site access, content, affiliate links, and disclaimers.",
  path: "/terms",
});

export default function TermsOfUsePage() {
  const lastUpdated = "March 20, 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-text-secondary">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-text-secondary">
        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="leading-relaxed">
            By accessing and using asiapicks.com (the &quot;Site&quot;), you accept and agree to
            be bound by these Terms of Use (&quot;Terms&quot;). If you do not agree to these
            Terms, you should not use the Site.
          </p>
          <p className="mt-3 leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the Site
            after changes constitutes your acceptance of the updated Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            2. Description of Service
          </h2>
          <p className="leading-relaxed">
            Asiapicks is an independent travel information website that provides destination
            guides, hotel recommendations, activity suggestions, and blog content related to
            travel in East and Southeast Asia. The Site also features content related to saju
            (Korean fortune-telling) as it relates to travel.
          </p>
          <p className="mt-3 leading-relaxed">
            The Site is provided for informational and entertainment purposes only. We are not a
            travel agency, tour operator, or booking platform.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            3. Affiliate Links and Third-Party Services
          </h2>
          <p className="leading-relaxed">
            Our Site contains affiliate links to third-party websites, including but not limited
            to Agoda (hotel bookings) and Klook (activities and tours). When you click on these
            links:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>You will be redirected to a third-party website</li>
            <li>
              Your interaction with that website is governed by their own terms and privacy policies
            </li>
            <li>
              We may earn a commission from qualifying purchases at no additional cost to you
            </li>
            <li>
              We are not responsible for the content, accuracy, or practices of third-party websites
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            For full details about our affiliate relationships, please read our{" "}
            <Link href="/affiliate-disclosure" className="text-primary hover:underline">
              Affiliate Disclosure
            </Link>.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            4. Content Accuracy and Disclaimers
          </h2>
          <p className="leading-relaxed">
            We strive to provide accurate and up-to-date travel information. However:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>
              <strong>Prices:</strong> Hotel rates, activity prices, and other costs mentioned on
              the Site are approximate and subject to change. Always verify current prices directly
              with the provider before booking.
            </li>
            <li>
              <strong>Availability:</strong> Accommodation and activity availability may vary by
              date and season. We cannot guarantee availability of any listed product or service.
            </li>
            <li>
              <strong>Travel conditions:</strong> Visa requirements, entry restrictions, local
              regulations, and travel advisories change frequently. Always check official government
              sources before traveling.
            </li>
            <li>
              <strong>Saju content:</strong> Content related to saju (Korean fortune-telling),
              astrology, and elemental travel recommendations is provided for entertainment and
              cultural interest only. It should not be relied upon as the sole basis for travel
              decisions.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed font-medium text-text-primary">
            THE SITE AND ITS CONTENT ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY
            KIND, WHETHER EXPRESS OR IMPLIED.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            5. Intellectual Property
          </h2>
          <p className="leading-relaxed">
            All original content on the Site — including text, graphics, logos, page layouts, and
            the selection and arrangement of content — is the property of Asiapicks and is
            protected by copyright law.
          </p>
          <p className="mt-3 leading-relaxed">
            You may not reproduce, distribute, modify, or republish any content from the Site
            without prior written permission, except for personal, non-commercial use such as
            sharing a link to a blog post.
          </p>
          <p className="mt-3 leading-relaxed">
            Travel photographs used on this Site are sourced from Unsplash and are used in
            accordance with the Unsplash License. Photographer credits are provided where
            applicable.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            6. User Conduct
          </h2>
          <p className="leading-relaxed">
            When using the Site, you agree not to:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>Use the Site for any unlawful purpose</li>
            <li>
              Attempt to gain unauthorized access to any part of the Site or its systems
            </li>
            <li>
              Scrape, crawl, or use automated tools to extract content from the Site beyond
              what is permitted by our robots.txt
            </li>
            <li>
              Transmit any viruses, malware, or other harmful code
            </li>
            <li>
              Impersonate any person or entity, or misrepresent your affiliation with any
              person or entity
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            7. Limitation of Liability
          </h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by law, Asiapicks shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>Your use of or inability to use the Site</li>
            <li>Any errors or omissions in the Site&apos;s content</li>
            <li>
              Any bookings, purchases, or transactions made through third-party affiliate links
            </li>
            <li>
              Any travel decisions made based on information provided on the Site
            </li>
            <li>
              Any unauthorized access to or use of our servers or personal information
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Our total liability for any claim arising from or relating to the Site shall not
            exceed the amount you paid to us (if any) in the 12 months preceding the claim.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            8. Indemnification
          </h2>
          <p className="leading-relaxed">
            You agree to indemnify and hold harmless Asiapicks, its operators, and affiliates
            from any claims, damages, losses, or expenses (including reasonable legal fees)
            arising from your use of the Site or violation of these Terms.
          </p>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            9. External Links
          </h2>
          <p className="leading-relaxed">
            The Site contains links to external websites operated by third parties. These links
            are provided for convenience and informational purposes only. We do not endorse,
            control, or assume responsibility for the content or practices of any linked website.
            Accessing external sites is at your own risk.
          </p>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            10. Governing Law
          </h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the
            Republic of Korea, without regard to its conflict of law provisions. Any disputes
            arising from these Terms or your use of the Site shall be subject to the exclusive
            jurisdiction of the courts of Seoul, Republic of Korea.
          </p>
        </section>

        {/* Section 11 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            11. Severability
          </h2>
          <p className="leading-relaxed">
            If any provision of these Terms is found to be unenforceable or invalid, that
            provision shall be limited or eliminated to the minimum extent necessary, and the
            remaining provisions shall remain in full force and effect.
          </p>
        </section>

        {/* Section 12 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            12. Contact Us
          </h2>
          <p className="leading-relaxed">
            If you have any questions about these Terms, please contact us at:
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
            <Link href="/affiliate-disclosure" className="text-primary hover:underline">
              Affiliate Disclosure
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
