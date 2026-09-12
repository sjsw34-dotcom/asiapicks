import Image from "next/image";
import { getImage } from "@/lib/images/registry";
import { parseIdList } from "@/lib/affiliates/offers";

/**
 * A row of related images. Every item carries its own credit and licence:
 * CC BY-SA attribution is per photograph, so a single shared caption would
 * not satisfy it.
 */
export default function Gallery({ ids, columns = "2" }: { ids: string; columns?: string }) {
  const images = parseIdList(ids).map(getImage);
  if (images.length === 0) return null;
  const cols = columns === "3" ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`my-8 grid gap-4 ${cols}`}>
      {images.map((img) => {
        const credit = img.aiGenerated ? "Illustration (AI-generated)" : `${img.credit} (${img.license})`;
        return (
          <figure key={img.id} className="m-0">
            <Image
              src={img.src}
              width={img.width}
              height={img.height}
              alt={img.decorative ? "" : img.alt}
              sizes="(max-width: 640px) 100vw, 384px"
              className="h-56 w-full rounded-xl object-cover"
            />
            <figcaption className="mt-2 text-xs text-text-secondary">
              {img.caption ? <span className="block text-text-primary">{img.caption}</span> : null}
              {img.sourceUrl ? (
                <a href={img.sourceUrl} rel="noopener" target="_blank" className="underline underline-offset-2">
                  {credit}
                </a>
              ) : (
                credit
              )}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
