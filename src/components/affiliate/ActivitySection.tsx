import ActivityCard from "@/components/cards/ActivityCard";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import type { Activity } from "@/types/destination";

interface ActivitySectionProps {
  activities: Activity[];
  cityName: string;
}

export default function ActivitySection({ activities, cityName }: ActivitySectionProps) {
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
    </section>
  );
}
