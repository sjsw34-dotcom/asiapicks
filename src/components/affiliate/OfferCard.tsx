import Image from "next/image";
import { getOffer, type Offer } from "@/lib/affiliates/offers";
import { buildAffiliateUrl, PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { getImage } from "@/lib/images/registry";

const KIND_LABEL: Record<Offer["kind"], string> = {
  tour: "Tour", experience: "Experience", hotel: "Hotel", ticket: "Ticket", transfer: "Transfer", rail: "Train",
};

export function offerLinkProps(offer: Offer, sourceSlug: string) {
  const { url, tracked } = buildAffiliateUrl(offer.provider, offer.targetUrl, sourceSlug);
  return {
    href: url,
    target: "_blank",
    rel: tracked ? "sponsored nofollow noopener" : "nofollow noopener",
    "data-offer": offer.id,
    "data-provider": offer.provider,
  } as const;
}

export const checkedLabel = (iso?: string) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : null;

export default function OfferCard({ id, sourceSlug }: { id: string; sourceSlug: string }) {
  const offer = getOffer(id);
  const img = offer.image ? getImage(offer.image) : null;
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-white">
      {img ? (
        <Image src={img.src} width={img.width} height={img.height} alt={img.decorative ? "" : img.alt}
          sizes="(max-width: 768px) 100vw, 360px" className="h-44 w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{KIND_LABEL[offer.kind]} · {provider}</p>
        <h3 className="font-heading text-lg font-semibold text-text-primary">{offer.title}</h3>
        <p className="text-sm text-text-secondary">{offer.summary}</p>
        {offer.priceText ? (
          <p className="text-sm text-text-primary">
            {offer.priceText} <span className="text-text-secondary">(checked {checkedLabel(offer.priceCheckedAt)})</span>
          </p>
        ) : null}
        <a {...offerLinkProps(offer, sourceSlug)}
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white hover:bg-secondary-dark">
          Check availability on {provider}
        </a>
      </div>
    </article>
  );
}
