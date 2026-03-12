import Link from "next/link";
import Image from "next/image";
import type { CityData } from "@/types/destination";

interface DestinationCardProps {
  city: CityData;
}

export default function DestinationCard({ city }: DestinationCardProps) {
  const href = `/destinations/${city.country.toLowerCase()}/${city.id}`;

  return (
    <Link
      href={href}
      className="group block rounded-xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-surface overflow-hidden">
        <Image
          src={city.heroImage}
          alt={`${city.name}, ${city.country}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <span className="absolute top-3 left-3 text-2xl">{city.flag}</span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold font-heading text-text-primary group-hover:text-primary transition-colors">
          {city.name}
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">{city.country}</p>
        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
          {city.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {city.themes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 rounded-full bg-surface text-xs text-text-secondary border border-border capitalize"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
