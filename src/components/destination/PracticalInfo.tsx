import type { CityData } from "@/types/destination";

interface PracticalInfoProps {
  city: CityData;
}

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PracticalInfo({ city }: PracticalInfoProps) {
  const { gettingThere, localTransport, weather } = city.practicalInfo;
  const maxTemp = Math.max(...weather.map((w) => w.high));

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold font-heading text-text-primary mb-6">
        Practical Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Getting There */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-2">
            <span aria-hidden="true">✈️</span> Getting There
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">{gettingThere}</p>
        </div>

        {/* Local Transport */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-2">
            <span aria-hidden="true">🚇</span> Getting Around
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">{localTransport}</p>
        </div>
      </div>

      {/* Weather Chart */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span aria-hidden="true">🌤️</span> Monthly Weather
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {weather.map((w, i) => {
              const barHeight = Math.round((w.high / maxTemp) * 64);
              return (
                <div key={i} className="flex flex-col items-center gap-1 w-10">
                  {/* Temp bar */}
                  <div className="flex flex-col justify-end h-16 w-full">
                    <div
                      className="w-full rounded-t bg-primary/20 relative"
                      style={{ height: `${barHeight}px` }}
                    >
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-primary"
                        style={{ height: `${Math.round((w.low / maxTemp) * 64)}px` }}
                      />
                    </div>
                  </div>
                  {/* High / Low */}
                  <span className="text-[10px] font-medium text-text-primary">{w.high}°</span>
                  <span className="text-[10px] text-text-secondary">{w.low}°</span>
                  {/* Rain dot */}
                  <div className="w-2 h-2 rounded-full bg-blue-300 opacity-50"
                    style={{ opacity: Math.min(w.rain / 300, 1) }}
                    title={`${w.rain}mm rain`}
                  />
                  <span className="text-[10px] text-text-secondary">{MONTH_ABBR[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-primary" /> High temp
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-primary/20" /> Low temp
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-300" /> Rainfall
          </span>
        </div>
      </div>
    </section>
  );
}
