import Image from "next/image";
import type { CityData } from "@/types/destination";

interface CityHeroProps {
  city: CityData;
}

const INFO_ITEMS = [
  { key: "bestSeason", icon: "🌸", label: "Best Time" },
  { key: "avgBudget", icon: "💰", label: "Budget" },
  { key: "timezone", icon: "🕐", label: "Timezone" },
  { key: "currency", icon: "💴", label: "Currency" },
  { key: "visa", icon: "🛂", label: "Visa" },
] as const;

export default function CityHero({ city }: CityHeroProps) {
  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-[60vh] min-h-[400px] w-full bg-slate-800">
        <Image
          src={city.heroImage}
          alt={`${city.name}, ${city.country}`}
          fill
          className="object-cover opacity-75"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* City Name */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{city.flag}</span>
              <span className="text-white/80 text-sm font-medium">{city.country}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-white leading-tight">
              {city.name}
            </h1>
          </div>
        </div>

        {/* Unsplash Credit */}
        {city.heroImageCredit && (
          <p className="absolute bottom-2 right-3 text-[10px] text-white/50">
            Photo by{" "}
            <a
              href={city.heroImageCredit.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/80"
            >
              {city.heroImageCredit.name}
            </a>{" "}
            / Unsplash
          </p>
        )}
      </div>

      {/* QuickInfo Bar */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 divide-x divide-border py-0 scrollbar-hide">
            {INFO_ITEMS.map(({ key, icon, label }) => (
              <div key={key} className="flex flex-col items-start px-4 py-3 shrink-0">
                <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                  {icon} {label}
                </span>
                <span className="mt-0.5 text-sm font-medium text-text-primary whitespace-nowrap max-w-[160px] truncate">
                  {city.quickInfo[key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
