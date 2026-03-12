import { notFound } from "next/navigation";
import { getCityBySlug, getAllCitySlugs, getRelatedCities } from "@/lib/destinations";
import affiliates from "@/data/affiliates.json";
import { generatePageMetadata, touristDestinationSchema, getOGImageUrl } from "@/lib/seo";
import JsonLd from "@/components/common/JsonLd";
import CityHero from "@/components/destination/CityHero";
import StickyBookingBar from "@/components/affiliate/StickyBookingBar";
import HotelSection from "@/components/affiliate/HotelSection";
import ActivitySection from "@/components/affiliate/ActivitySection";
import ItineraryTimeline from "@/components/destination/ItineraryTimeline";
import PracticalInfo from "@/components/destination/PracticalInfo";
import SajuInsightBox from "@/components/saju/SajuInsightBox";
import RelatedCities from "@/components/destination/RelatedCities";

interface Props {
  params: Promise<{ country: string; city: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs();
}

export async function generateMetadata({ params }: Props) {
  const { country, city: citySlug } = await params;
  const city = getCityBySlug(country, citySlug);
  if (!city) return {};
  return generatePageMetadata({
    title: `${city.name} Travel Guide — Best Hotels, Things to Do & Tips`,
    description: `Plan your trip to ${city.name}. Find the best hotels, top activities, a ${city.itinerary["3days"].length}-day itinerary, and practical travel tips for ${city.country}.`,
    path: `/destinations/${country}/${citySlug}`,
    image: getOGImageUrl(
      `${city.name} Travel Guide`,
      city.id
    ),
  });
}

export default async function CityPage({ params }: Props) {
  const { country, city: citySlug } = await params;
  const city = getCityBySlug(country, citySlug);
  if (!city) notFound();

  const relatedCities = getRelatedCities(city, 3);
  const klookWidgetCid = (affiliates.klook.widgetCids as Record<string, string>)[city.id] ?? "";

  // Show SajuInsightBox on ~every 3rd city (deterministic, not random)
  const showSaju = (city.name.charCodeAt(0) % 3) === 0;

  return (
    <>
      <JsonLd schema={touristDestinationSchema(city)} />

      {/* Sticky bar — client component */}
      <StickyBookingBar citySlug={city.id} cityName={city.name} />

      {/* Hero + QuickInfo */}
      <CityHero city={city} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Overview */}
        <section className="mt-10 max-w-3xl">
          <h2 className="text-xl font-bold font-heading text-text-primary mb-4">
            About {city.name}
          </h2>
          <p className="text-text-secondary leading-relaxed">{city.description}</p>
        </section>

        {/* Hotels */}
        <HotelSection hotels={city.hotels} cityName={city.name} />

        {/* Activities */}
        <ActivitySection activities={city.activities} cityName={city.name} klookWidgetCid={klookWidgetCid} />

        {/* Itinerary */}
        <ItineraryTimeline
          days={city.itinerary["3days"]}
          cityName={city.name}
        />

        {/* Practical Info */}
        <PracticalInfo city={city} />

        {/* Saju Insight (selective) */}
        {showSaju && (
          <SajuInsightBox
            campaign={`city-${city.id}`}
            text={`Planning a trip to ${city.name}? Your Saju birth elements may reveal whether this destination truly aligns with your energy — and the best time to visit.`}
          />
        )}

        {/* Related Cities */}
        <RelatedCities cities={relatedCities} />
      </div>
    </>
  );
}
