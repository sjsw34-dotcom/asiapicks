import DestinationCard from "@/components/cards/DestinationCard";
import type { CityData } from "@/types/destination";

interface RelatedCitiesProps {
  cities: CityData[];
}

export default function RelatedCities({ cities }: RelatedCitiesProps) {
  if (cities.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold font-heading text-text-primary mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cities.map((city) => (
          <DestinationCard key={city.id} city={city} />
        ))}
      </div>
    </section>
  );
}
