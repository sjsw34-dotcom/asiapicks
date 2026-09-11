import { getOffer } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

export default function BookingCTA({ id, sourceSlug, heading }: { id: string; sourceSlug: string; heading?: string }) {
  const offer = getOffer(id);
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <aside className="my-10 rounded-2xl border border-secondary/30 bg-orange-50 p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-dark">Affiliate option</p>
      <h3 className="mt-1 font-heading text-xl font-semibold text-text-primary">{heading ?? offer.title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{offer.summary}</p>
      <a {...offerLinkProps(offer, sourceSlug)}
        className="mt-4 inline-flex items-center rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary-dark">
        Check availability on {provider}
      </a>
    </aside>
  );
}
