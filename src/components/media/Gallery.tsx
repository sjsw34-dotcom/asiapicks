import Image from "next/image";
import { getImage } from "@/lib/images/registry";
import { parseIdList } from "@/lib/affiliates/offers";

/**
 * A row of related images. Credits are not printed per item: ImageCredits at
 * the foot of the page attributes every photograph shown on it, which is what
 * the licence asks for without a licence line under every thumbnail.
 */
export default function Gallery({ ids, columns = "2" }: { ids: string; columns?: string }) {
  const images = parseIdList(ids).map(getImage);
  if (images.length === 0) return null;
  const cols = columns === "3" ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`my-8 grid gap-4 ${cols}`}>
      {images.map((img) => {
        const caption = [img.caption, img.aiGenerated ? "Illustration (AI-generated)" : null].filter(Boolean).join(". ");
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
            {caption ? <figcaption className="mt-2 text-xs text-text-primary">{caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}
