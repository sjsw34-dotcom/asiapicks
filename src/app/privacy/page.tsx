import { generatePageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "Privacy Policy — Asiapicks",
  description:
    "Learn how Asiapicks.com collects, uses, and protects your personal information. Read our full privacy policy.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 20, 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-text-secondary">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-text-secondary">
        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            1. Introduction
          </h2>
          <p className="leading-relaxed">
            Asiapicks (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website
            asiapicks.com (the &quot;Site&quot;). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our Site.
          </p>
          <p className="mt-3 leading-relaxed">
            By using the Site, you agree to the collection and use of information in accordance
            with this policy. If you do not agree, please do not use the Site.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            2. Information We Collect
          </h2>

          <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">
            2.1 Automatically Collected Information
          </h3>
          <p className="leading-relaxed">
            When you visit our Site, we may automatically collect certain information about your
            device and usage, including:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>IP address and approximate geographic location</li>
            <li>Browser type, version, and operating system</li>
            <li>Pages visited, time spent on pages, and referring URLs</li>
            <li>Device type (desktop, mobile, tablet)</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            This data is collected through Google Analytics 4 (GA4) and server logs to help us
            understand how visitors use our Site and improve our content.
          </p>

          <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">
            2.2 Information You Provide
          </h3>
          <p className="leading-relaxed">
            We may collect information you voluntarily provide, such as your email address when
            you contact us at contact@asiapicks.com. We do not operate a newsletter sign-up or
            user registration system at this time.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            3. Cookies and Tracking Technologies
          </h2>
          <p className="leading-relaxed">
            Our Site uses cookies and similar tracking technologies for the following purposes:
          </p>

          <div className="mt-4 space-y-3 not-prose">
            <div className="border border-border rounded-xl p-4 bg-surface">
              <h4 className="font-semibold text-text-primary text-sm mb-1">Essential Cookies</h4>
              <p className="text-sm text-text-secondary">
                Required for basic site functionality such as page navigation and security.
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-surface">
              <h4 className="font-semibold text-text-primary text-sm mb-1">Analytics Cookies</h4>
              <p className="text-sm text-text-secondary">
                Google Analytics 4 cookies help us understand visitor behavior. Data is anonymized
                and aggregated. You can opt out using the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-surface">
              <h4 className="font-semibold text-text-primary text-sm mb-1">
                Third-Party / Affiliate Cookies
              </h4>
              <p className="text-sm text-text-secondary">
                When you click affiliate links to Agoda or Klook, those sites may place their own
                cookies on your device to track referrals and commissions. These cookies are governed
                by the respective partner&apos;s privacy policies:
              </p>
              <ul className="text-sm text-text-secondary mt-2 space-y-1 list-disc list-inside">
                <li>Agoda Privacy Policy: agoda.com/info/privacy-policy</li>
                <li>Klook Privacy Policy: klook.com/en-US/policy/privacy</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            4. How We Use Your Information
          </h2>
          <p className="leading-relaxed">
            We use the information we collect for the following purposes:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>To operate, maintain, and improve the Site</li>
            <li>To analyze usage trends and optimize content</li>
            <li>To respond to your inquiries or correspondence</li>
            <li>To detect and prevent technical issues or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties for marketing
            purposes.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            5. Third-Party Services
          </h2>
          <p className="leading-relaxed">
            Our Site uses the following third-party services that may collect information:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>
              <strong>Google Analytics 4</strong> — website analytics and traffic measurement
            </li>
            <li>
              <strong>Vercel</strong> — website hosting and performance optimization
            </li>
            <li>
              <strong>Unsplash</strong> — travel photography (no user data is shared with Unsplash)
            </li>
            <li>
              <strong>Agoda &amp; Klook</strong> — affiliate partners (data collection occurs on
              their sites when you click affiliate links)
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Each third-party service operates under its own privacy policy. We encourage you to
            review their policies before interacting with their services.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            6. Data Retention
          </h2>
          <p className="leading-relaxed">
            Analytics data is retained for up to 14 months in Google Analytics, after which it is
            automatically deleted. Any personal information you provide via email correspondence
            is retained only as long as necessary to fulfill the purpose for which it was collected.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            7. Your Rights
          </h2>
          <p className="leading-relaxed">
            Depending on your location, you may have the following rights regarding your
            personal data:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>
              <strong>Access:</strong> Request a copy of the personal data we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data
            </li>
            <li>
              <strong>Opt-out:</strong> Opt out of analytics tracking using browser settings or
              the Google Analytics opt-out add-on
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            To exercise any of these rights, contact us at{" "}
            <span className="text-primary">contact@asiapicks.com</span>.
          </p>
        </section>

        {/* Section 8 - GDPR */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            8. For EEA / UK Visitors (GDPR)
          </h2>
          <p className="leading-relaxed">
            If you are located in the European Economic Area (EEA) or United Kingdom, our legal
            basis for collecting and using your personal information is:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-sm">
            <li>
              <strong>Legitimate interest:</strong> To operate and improve our Site
            </li>
            <li>
              <strong>Consent:</strong> Where required for non-essential cookies (analytics)
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            You have the right to lodge a complaint with your local data protection authority if
            you believe your data has been processed unlawfully.
          </p>
        </section>

        {/* Section 9 - CCPA */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            9. For California Residents (CCPA)
          </h2>
          <p className="leading-relaxed">
            Under the California Consumer Privacy Act (CCPA), California residents have additional
            rights including the right to know what personal information is collected, the right to
            delete it, and the right to opt out of the sale of personal information. We do not sell
            personal information.
          </p>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            10. Children&apos;s Privacy
          </h2>
          <p className="leading-relaxed">
            Our Site is not directed to individuals under the age of 13. We do not knowingly
            collect personal information from children. If you are a parent or guardian and believe
            your child has provided us with personal data, please contact us so we can take
            appropriate action.
          </p>
        </section>

        {/* Section 11 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            11. Changes to This Policy
          </h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated &quot;Last updated&quot; date. We encourage you to review this
            page periodically for any changes.
          </p>
        </section>

        {/* Section 12 */}
        <section>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
            12. Contact Us
          </h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2 font-medium text-text-primary">
            contact@asiapicks.com
          </p>
        </section>

        {/* Footer nav */}
        <div className="pt-6 border-t border-border not-prose">
          <p className="text-sm text-text-secondary">
            See also:{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
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
