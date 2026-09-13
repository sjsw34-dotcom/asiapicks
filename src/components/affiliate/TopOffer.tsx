import { getOffer } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

/**
 * A single booking link directly under the answer box. On a phone most readers
 * stop after the answer, so the page's booking option has to be reachable there,
 * not only at the foot. Labelled as an affiliate link where it sits.
 */
export default function TopOffer({ id, sourceSlug }: { id: string; sourceSlug: string }) {
  const offer = getOffer(id);
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <div className="-mt-3 mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-b-xl border border-t-0 border-border px-5 py-3">
      <p className="min-w-0 flex-1 text-sm text-text-primary">
        <span className="font-semibold">{offer.title}</span>
        <span className="text-text-secondary"> · affiliate link</span>
      </p>
      <a {...offerLinkProps(offer, sourceSlug)}
        className="inline-flex shrink-0 items-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white hover:bg-secondary-dark">
        Check on {provider}
      </a>
    </div>
  );
}
