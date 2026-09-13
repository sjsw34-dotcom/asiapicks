import { getImage } from "@/lib/images/registry";

/**
 * Attribution for every image a page renders. CC BY-SA and KOGL require the
 * credit to appear on the page that uses the photograph, but a credit line
 * under each image reads as clutter on a page whose job is to answer a
 * question, so they are collected here once.
 */
export default function ImageCredits({ ids }: { ids: (string | null | undefined)[] }) {
  const images = [...new Set(ids.filter((id): id is string => !!id))].map(getImage);
  if (images.length === 0) return null;
  return (
    <section className="mt-4">
      <h2 className="font-semibold text-text-primary">Image credits</h2>
      <ul className="mt-2 space-y-1">
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
