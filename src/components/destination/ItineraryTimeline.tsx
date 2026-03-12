import type { ItineraryDay } from "@/types/destination";

const TYPE_COLORS: Record<string, string> = {
  attraction: "bg-blue-100 text-blue-700",
  food: "bg-orange-100 text-orange-700",
  shopping: "bg-pink-100 text-pink-700",
  nightlife: "bg-purple-100 text-purple-700",
  entertainment: "bg-yellow-100 text-yellow-700",
  default: "bg-surface text-text-secondary",
};

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  cityName: string;
}

export default function ItineraryTimeline({ days, cityName }: ItineraryTimelineProps) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold font-heading text-text-primary mb-6">
        {days.length}-Day {cityName} Itinerary
      </h2>

      <div className="space-y-8">
        {days.map((day) => (
          <div key={day.day}>
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                {day.day}
              </span>
              <h3 className="font-semibold font-heading text-text-primary">
                Day {day.day}: {day.title}
              </h3>
            </div>

            {/* Timeline Items */}
            <div className="ml-4 border-l-2 border-border pl-6 space-y-4">
              {day.items.map((item, idx) => {
                const colorClass =
                  TYPE_COLORS[item.type] ?? TYPE_COLORS.default;
                return (
                  <div key={idx} className="relative">
                    {/* Dot */}
                    <span className="absolute -left-[1.625rem] top-1 w-3 h-3 rounded-full bg-white border-2 border-primary" />
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-text-secondary shrink-0 w-12 pt-0.5">
                        {item.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium leading-snug">
                          {item.activity}
                        </p>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${colorClass}`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
