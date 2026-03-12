import { getAllCities } from "@/lib/destinations";
import { generatePageMetadata } from "@/lib/seo";
import DestinationsFilter from "@/components/destinations/DestinationsFilter";
import countriesData from "@/data/countries.json";
import themesData from "@/data/themes.json";

export const metadata = generatePageMetadata({
  title: "Asia Travel Destinations — Cities, Guides & Tips",
  description:
    "Explore the best cities in Japan, Thailand, South Korea, and Vietnam. Find hotels, activities, and expert travel guides for every destination.",
  path: "/destinations",
});

export default function DestinationsPage() {
  const cities = getAllCities();
  const countries = countriesData.map((c) => ({ id: c.id, name: c.name, flag: c.flag }));
  const themes = themesData.map((t) => ({ id: t.id, name: t.name }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
          Asia Travel Destinations
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Handpicked cities across East and Southeast Asia — with hotel
          recommendations, activity guides, and day-by-day itineraries.
        </p>
      </div>

      <DestinationsFilter cities={cities} themes={themes} countries={countries} />
    </div>
  );
}
