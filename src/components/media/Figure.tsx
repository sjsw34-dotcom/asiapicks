import Image from "next/image";
import { getImage } from "@/lib/images/registry";

interface FigureProps {
  id: string;
  priority?: boolean;
  sizes?: string;
}

export default function Figure({ id, priority = false, sizes = "(max-width: 768px) 100vw, 768px" }: FigureProps) {
  const img = getImage(id);
  const credit = img.aiGenerated ? "Illustration (AI-generated)" : `Photo: ${img.credit} (${img.license})`;
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
      <figcaption className="mt-2 text-xs text-text-secondary">
        {img.caption ? <span>{img.caption}. </span> : null}
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
}
