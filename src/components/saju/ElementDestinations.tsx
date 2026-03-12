import Link from "next/link";
import Image from "next/image";

interface Destination {
  name: string;
  country: string;
  image: string;
  slug?: string; // if has a detail page
}

interface Element {
  symbol: string;
  name: string;
  emoji: string;
  color: {
    bg: string;
    badge: string;
    border: string;
    text: string;
    glow: string;
  };
  keyword: string;
  description: string;
  traits: string[];
  destinations: Destination[];
}

const ELEMENTS: Element[] = [
  {
    symbol: "木",
    name: "Wood",
    emoji: "🌳",
    color: {
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-800",
      border: "border-emerald-200",
      text: "text-emerald-700",
      glow: "shadow-emerald-100",
    },
    keyword: "Forest & Nature",
    description:
      "Wood energy seeks growth, organic beauty, and living traditions. You're drawn to places where nature and culture intertwine — ancient forests, terraced fields, artisan villages.",
    traits: ["Creative", "Idealistic", "Growth-oriented", "Nature-lover"],
    destinations: [
      {
        name: "Chiang Mai",
        country: "Thailand",
        image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
        slug: "thailand/chiang-mai",
      },
      {
        name: "Ubud, Bali",
        country: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
      },
      {
        name: "Kyoto",
        country: "Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
        slug: "japan/kyoto",
      },
    ],
  },
  {
    symbol: "火",
    name: "Fire",
    emoji: "🔥",
    color: {
      bg: "bg-orange-50",
      badge: "bg-orange-100 text-orange-800",
      border: "border-orange-200",
      text: "text-orange-700",
      glow: "shadow-orange-100",
    },
    keyword: "Tropical & Vibrant",
    description:
      "Fire energy is expansive, social, and drawn to spectacle. You thrive in places with heat, color, noise, and intensity — cities that never dim, feasts that never end.",
    traits: ["Passionate", "Social", "Expressive", "Adventurous"],
    destinations: [
      {
        name: "Bangkok",
        country: "Thailand",
        image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
        slug: "thailand/bangkok",
      },
      {
        name: "Phuket",
        country: "Thailand",
        image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
      },
      {
        name: "Ho Chi Minh City",
        country: "Vietnam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80",
      },
    ],
  },
  {
    symbol: "土",
    name: "Earth",
    emoji: "🏔️",
    color: {
      bg: "bg-amber-50",
      badge: "bg-amber-100 text-amber-800",
      border: "border-amber-200",
      text: "text-amber-700",
      glow: "shadow-amber-100",
    },
    keyword: "Heritage & Mountains",
    description:
      "Earth energy values depth, stability, and nourishment. You want to understand a place — its history, its food, its people. You extend your stays without fully knowing why.",
    traits: ["Grounded", "Patient", "Nurturing", "Culturally curious"],
    destinations: [
      {
        name: "Kyoto",
        country: "Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
        slug: "japan/kyoto",
      },
      {
        name: "Siem Reap",
        country: "Cambodia",
        image: "https://images.unsplash.com/photo-1508159452718-d22f6734a00d?w=600&q=80",
      },
      {
        name: "Luang Prabang",
        country: "Laos",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      },
    ],
  },
  {
    symbol: "金",
    name: "Metal",
    emoji: "⚔️",
    color: {
      bg: "bg-slate-50",
      badge: "bg-slate-100 text-slate-700",
      border: "border-slate-200",
      text: "text-slate-600",
      glow: "shadow-slate-100",
    },
    keyword: "Modern Cities",
    description:
      "Metal energy is precise, aesthetic, and driven by excellence. You have the highest standards of any element type — for design, food, service, and experience. You don't accept good enough.",
    traits: ["Perfectionist", "Principled", "Refined", "Detail-oriented"],
    destinations: [
      {
        name: "Tokyo",
        country: "Japan",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
        slug: "japan/tokyo",
      },
      {
        name: "Singapore",
        country: "Singapore",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
      },
      {
        name: "Seoul",
        country: "South Korea",
        image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80",
        slug: "korea/seoul",
      },
    ],
  },
  {
    symbol: "水",
    name: "Water",
    emoji: "🌊",
    color: {
      bg: "bg-cyan-50",
      badge: "bg-cyan-100 text-cyan-800",
      border: "border-cyan-200",
      text: "text-cyan-700",
      glow: "shadow-cyan-100",
    },
    keyword: "Beach & Islands",
    description:
      "Water energy is fluid, adaptive, and drawn toward depth and mystery. You follow curiosity — down side streets, into conversations, through history. You're comfortable with ambiguity.",
    traits: ["Intuitive", "Adaptable", "Reflective", "Depth-seeking"],
    destinations: [
      {
        name: "Bali",
        country: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
      },
      {
        name: "Palawan",
        country: "Philippines",
        image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80",
      },
      {
        name: "Hanoi",
        country: "Vietnam",
        image: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&q=80",
        slug: "vietnam/hanoi",
      },
    ],
  },
];

export default function ElementDestinations() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-text-primary">
          Find Your Element's Destination
        </h2>
        <p className="mt-3 text-text-secondary max-w-xl mx-auto">
          Each of the five elements resonates with specific landscapes, cities, and
          experiences. Which energy flows through you?
        </p>
      </div>

      <div className="space-y-10">
        {ELEMENTS.map((el, i) => (
          <div
            key={el.name}
            className={`rounded-2xl border ${el.color.border} ${el.color.bg} overflow-hidden shadow-sm ${el.color.glow}`}
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Info Panel */}
              <div className="p-7 md:p-10 flex flex-col justify-center">
                {/* Element badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-5xl font-bold font-heading ${el.color.text}`}
                  >
                    {el.symbol}
                  </span>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${el.color.badge}`}
                    >
                      {el.emoji} {el.name} Element
                    </span>
                    <p className={`mt-1 text-sm font-semibold ${el.color.text}`}>
                      {el.keyword}
                    </p>
                  </div>
                </div>

                <p className="text-text-secondary leading-relaxed">
                  {el.description}
                </p>

                {/* Traits */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {el.traits.map((t) => (
                    <span
                      key={t}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${el.color.border} ${el.color.text} bg-white/60`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Destination Cards */}
              <div className="grid grid-cols-3 gap-1 p-1">
                {el.destinations.map((dest) => {
                  const href = dest.slug
                    ? `/destinations/${dest.slug}`
                    : "/destinations";
                  return (
                    <Link
                      key={dest.name}
                      href={href}
                      className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-800"
                    >
                      <Image
                        src={dest.image}
                        alt={`${dest.name}, ${dest.country}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 p-3">
                        <p className="text-white font-semibold text-xs leading-tight">
                          {dest.name}
                        </p>
                        <p className="text-white/60 text-[10px]">
                          {dest.country}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
