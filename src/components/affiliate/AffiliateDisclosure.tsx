type DisclosureVariant = "post" | "page" | "inline";

interface AffiliateDisclosureProps {
  variant?: DisclosureVariant;
}

export default function AffiliateDisclosure({
  variant = "inline",
}: AffiliateDisclosureProps) {
  if (variant === "post") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-6">
        <span className="text-base shrink-0">ℹ️</span>
        <p>
          <strong>Disclosure:</strong> This post contains affiliate links to
          Agoda and Klook. If you book through these links, we may earn a small
          commission at no extra cost to you. We only recommend places we
          genuinely believe in.
        </p>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="flex gap-3 rounded-lg bg-surface border border-border p-4 text-sm text-text-secondary mb-8">
        <span className="text-base shrink-0">💡</span>
        <p>
          Some hotel and activity links on this page are affiliate links. Booking
          through them supports Asiapicks at no extra charge to you. Prices shown
          are indicative — always check current rates on the booking platform.
        </p>
      </div>
    );
  }

  // inline
  return (
    <p className="mt-1.5 text-[11px] text-text-secondary">
      Affiliate link — we may earn a commission at no cost to you.
    </p>
  );
}
