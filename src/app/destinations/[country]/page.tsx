import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCitiesByCountry } from "@/lib/destinations";
import { generatePageMetadata } from "@/lib/seo";
import { getAgodaSearchLink } from "@/lib/affiliates";
import DestinationCard from "@/components/cards/DestinationCard";
import countriesData from "@/data/countries.json";

type Params = { country: string };

export function generateStaticParams(): Params[] {
  return countriesData.map((c) => ({ country: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const country = countriesData.find((c) => c.id === slug);
  if (!country) return {};
  return generatePageMetadata({
    title: `${country.name} Travel Guide — Best Cities, Hotels & Tips`,
    description: `Plan your ${country.name} trip. Explore top cities, find the best hotels on Agoda, book activities on Klook, and get expert travel advice.`,
    path: `/destinations/${country.id}`,
    image: country.heroImage,
  });
}

export default async function CountryPage({ params }: { params: Promise<Params> }) {
  const { country: slug } = await params;
  const country = countriesData.find((c) => c.id === slug);
  if (!country) notFound();

  const cities = getCitiesByCountry(country.name);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <Image
          src={country.heroImage}
          alt={`${country.name} travel`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
          <nav className="text-sm text-white/70 mb-3">
            <Link href="/destinations" className="hover:text-white transition-colors">
              Destinations
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{country.name}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white">
            {country.flag} {country.name}
          </h1>
          <p className="mt-2 text-white/80 max-w-xl text-sm md:text-base">
            {country.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Currency", value: country.currency },
            { label: "Language", value: country.language },
            { label: "Region", value: country.region },
            { label: "Visa", value: country.visa },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className="text-sm font-medium text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Cities */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-text-primary">
              Cities in {country.name}
            </h2>
            <span className="text-sm text-text-secondary">
              {cities.length} destination{cities.length !== 1 ? "s" : ""}
            </span>
          </div>

          {cities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <DestinationCard key={city.id} city={city} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary py-12 text-center">
              City guides coming soon for {country.name}...
            </p>
          )}
        </div>

        {/* Agoda CTA */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-text-primary">
              Find the best hotels in {country.name}
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Compare prices across hundreds of hotels on Agoda — often cheaper than booking direct.
            </p>
          </div>
          <a
            href={getAgodaSearchLink(country.cities[0] ?? country.id)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="shrink-0 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Search Hotels on Agoda
          </a>
        </div>
      </div>
    </div>
  );
}
