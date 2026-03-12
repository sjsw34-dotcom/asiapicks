import ActivityCard from "@/components/cards/ActivityCard";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import KlookWidget from "@/components/affiliate/KlookWidget";
import type { Activity } from "@/types/destination";

interface KlookWidget {
  cid: string;
  adid: string;
}

interface ActivitySectionProps {
  activities: Activity[];
  cityName: string;
  klookWidget?: KlookWidget;
}

export default function ActivitySection({ activities, cityName, klookWidget }: ActivitySectionProps) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold font-heading text-text-primary mb-2">
        Top Things to Do in {cityName}
      </h2>

      <AffiliateDisclosure variant="page" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {activities.map((activity) => (
          <ActivityCard key={activity.klookActivityId} activity={activity} />
        ))}
      </div>

      {klookWidget?.cid && <KlookWidget cid={klookWidget.cid} adid={klookWidget.adid} />}
    </section>
  );
}
