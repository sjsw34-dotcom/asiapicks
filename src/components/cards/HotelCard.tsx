import Image from "next/image";
import { getAgodaHotelLink } from "@/lib/affiliates";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import type { Hotel } from "@/types/destination";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const bookingUrl = getAgodaHotelLink(hotel.agodaHotelId);

  return (
    <article className="rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 w-full bg-surface">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold font-heading text-text-primary leading-tight">
            {hotel.name}
          </h3>
          <Badge
            label={hotel.tier === "mid-range" ? "Mid-Range" : hotel.tier.charAt(0).toUpperCase() + hotel.tier.slice(1)}
            variant={hotel.tier}
          />
        </div>

        <p className="mt-1 text-xs text-text-secondary">{hotel.area}</p>

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={hotel.rating} />
          <span className="text-sm font-semibold text-primary">
            {hotel.priceRange}
          </span>
        </div>

        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
          {hotel.description}
        </p>

        {/* CTA */}
        <div className="mt-4">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block w-full text-center rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2.5 transition-colors"
          >
            Check Price on Agoda
          </a>
          <AffiliateDisclosure variant="inline" />
        </div>
      </div>
    </article>
  );
}
