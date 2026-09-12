import Image from "next/image";
import { getImage } from "@/lib/images/registry";

interface FigureProps {
  id: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * A captioned image. The photographer credit is not printed here: ImageCredits
 * at the foot of the page attributes every image the page shows, which meets
 * the licence without a credit line under each photo. The AI-generated label is
 * a different thing and stays on the image, because that is a disclosure to the
 * reader rather than a licence condition.
 */
export default function Figure({ id, priority = false, sizes = "(max-width: 768px) 100vw, 768px" }: FigureProps) {
  const img = getImage(id);
  const caption = [img.caption, img.aiGenerated ? "Illustration (AI-generated)" : null].filter(Boolean).join(". ");
  return (
    <figure className="my-8">
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={img.decorative ? "" : img.alt}
        sizes={sizes}
        priority={priority}
        className="w-full h-auto rounded-xl"
      />
      {caption ? <figcaption className="mt-2 text-xs text-text-secondary">{caption}</figcaption> : null}
    </figure>
  );
}
