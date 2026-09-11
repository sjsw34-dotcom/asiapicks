import OfferCard from "./OfferCard";
import { parseIdList } from "@/lib/affiliates/offers";

export default function OfferList({ ids, sourceSlug }: { ids: string; sourceSlug: string }) {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {parseIdList(ids).map((id) => <OfferCard key={id} id={id} sourceSlug={sourceSlug} />)}
    </div>
  );
}
