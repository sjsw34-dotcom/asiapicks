import Link from "next/link";
import Image from "next/image";
import popularData from "@/data/popular-destinations.json";

export default function PopularDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-text-primary">
            Popular Destinations
          </h2>
          <p className="mt-1 text-text-secondary">
            The cities travelers keep coming back to
          </p>
        </div>
        <Link
          href="/destinations"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularData.map((dest, i) => {
          const href = dest.hasPage
            ? `/destinations/${dest.countrySlug}/${dest.id}`
            : "/destinations";

          const isLarge = i === 0; // Tokyo spans 2 cols on large screens

          return (
            <Link
              key={dest.id}
              href={href}
              className={`group relative rounded-2xl overflow-hidden bg-slate-800 aspect-[4/5] ${
                isLarge ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""
              }`}
            >
              <Image
                src={dest.image}
                alt={`${dest.name}, ${dest.country}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes={
                  isLarge
                    ? "(max-width: 640px) 50vw, 33vw"
                    : "(max-width: 640px) 50vw, 25vw"
                }
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Badge */}
              {dest.badge && (
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    dest.badge === "Most Popular"
                      ? "bg-primary text-white"
                      : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  }`}
                >
                  {dest.badge}
                </span>
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white/70 text-xs mb-0.5">
                  {dest.flag} {dest.country}
                </p>
                <h3
                  className={`font-bold font-heading text-white leading-tight ${
                    isLarge ? "text-2xl" : "text-base"
                  }`}
                >
                  {dest.name}
                </h3>
                <p
                  className={`text-white/70 leading-snug mt-1 ${
                    isLarge ? "text-sm" : "text-xs line-clamp-1"
                  }`}
                >
                  {dest.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile view all link */}
      <div className="sm:hidden mt-6 text-center">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View all destinations →
        </Link>
      </div>
    </section>
  );
}
