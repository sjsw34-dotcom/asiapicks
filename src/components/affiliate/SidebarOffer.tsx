import { getOffer } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

/** Desktop-only booking card pinned under the outline, in the margin the reading column leaves empty. */
export default function SidebarOffer({ id, sourceSlug }: { id: string; sourceSlug: string }) {
  const offer = getOffer(id);
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <aside className="mt-6 max-w-[32ch] rounded-xl border border-secondary/30 bg-orange-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-dark">Affiliate option</p>
      <p className="mt-1 font-heading font-semibold text-text-primary">{offer.title}</p>
      <p className="mt-1 text-sm text-text-secondary">{offer.summary}</p>
      <a {...offerLinkProps(offer, sourceSlug)}
        className="mt-3 inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white hover:bg-secondary-dark">
        Check on {provider}
      </a>
    </aside>
  );
}
