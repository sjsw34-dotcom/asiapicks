import { getOffer, parseIdList } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

export default function ComparisonTable({ ids, sourceSlug }: { ids: string; sourceSlug: string }) {
  const offers = parseIdList(ids).map(getOffer);
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold">Option</th>
            <th className="px-4 py-2.5 text-left font-semibold">Best for</th>
            <th className="px-4 py-2.5 text-left font-semibold">Typical price</th>
            <th className="px-4 py-2.5 text-left font-semibold">Book</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o.id} className="border-t border-border align-top">
              <td className="px-4 py-2.5 font-medium">{o.title}</td>
              <td className="px-4 py-2.5 text-text-secondary">{o.summary}</td>
              <td className="px-4 py-2.5 text-text-secondary">{o.priceText ?? "Varies"}</td>
              <td className="px-4 py-2.5">
                <a {...offerLinkProps(o, sourceSlug)} className="text-primary underline underline-offset-2">
                  {PROVIDER_LABELS[o.provider]}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
