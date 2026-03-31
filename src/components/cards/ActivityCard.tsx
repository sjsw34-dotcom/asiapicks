import Image from "next/image";
import { getKlookActivityLink } from "@/lib/affiliates";
import Badge from "@/components/ui/Badge";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import type { Activity } from "@/types/destination";

const CATEGORY_ICONS: Record<string, string> = {
  "transport-pass": "🎫",
  "food-tour": "🍜",
  "culture-tour": "🏛️",
  "art-culture": "🎨",
  "theme-park": "🎢",
  "day-trip": "🚌",
  entertainment: "🎭",
  "outdoor-adventure": "🏔️",
  wellness: "💆",
  default: "⭐",
};

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const bookingUrl = getKlookActivityLink(activity.klookActivityId);
  const icon = CATEGORY_ICONS[activity.category] ?? CATEGORY_ICONS.default;

  return (
    <article className="flex flex-col h-full rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-44 w-full bg-surface shrink-0">
        <Image
          src={activity.image}
          alt={activity.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute top-3 left-3 text-xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold font-heading text-text-primary leading-tight line-clamp-2">
          {activity.name}
        </h3>

        <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
          <span>⏱ {activity.duration}</span>
          <span className="font-semibold text-secondary">
            from {activity.price}
          </span>
        </div>

        <p className="mt-2 text-sm text-text-secondary line-clamp-2 flex-1">
          {activity.description}
        </p>

        {/* CTA */}
        <div className="mt-4">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block w-full text-center rounded-lg bg-secondary hover:bg-secondary-dark text-white text-sm font-medium py-2.5 transition-colors"
          >
            Book on Klook
          </a>
          <AffiliateDisclosure variant="inline" />
        </div>
      </div>
    </article>
  );
}
