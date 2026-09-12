import { getImage } from "@/lib/images/registry";

/**
 * Attribution for images that render without a caption of their own: the home
 * hero and the destination cards. CC BY-SA and KOGL both require the credit to
 * appear on the page, but a caption under every thumbnail crowds a page whose
 * job is to route people onward, so the credits are collected in one place.
 */
export default function ImageCredits({ ids }: { ids: string[] }) {
  const images = [...new Set(ids)].map(getImage);
  if (images.length === 0) return null;
  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="font-heading text-lg font-semibold">Image credits</h2>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        {images.map((img) => {
          const credit = img.aiGenerated ? "Illustration (AI-generated)" : `${img.credit} (${img.license})`;
          return (
            <li key={img.id}>
              {img.caption ?? img.alt}:{" "}
              {img.sourceUrl ? (
                <a href={img.sourceUrl} target="_blank" rel="noopener" className="underline underline-offset-2">{credit}</a>
              ) : (
                credit
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
