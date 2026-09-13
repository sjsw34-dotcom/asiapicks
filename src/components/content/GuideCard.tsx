import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/content/loader";
import { getImage } from "@/lib/images/registry";

/**
 * A related guide placed inside the body, where the text hands the reader on.
 * A plain underlined link is easy to miss on a phone; a card with a photo is not.
 * The target must be a live page: an unknown path fails the build.
 */
export default function GuideCard({ href }: { href: string }) {
  const node = getContent().byPath.get(href);
  if (!node || node.kind === "category") throw new Error(`GuideCard: no article or hub at ${href}`);
  const img = node.fm.featuredImage ? getImage(node.fm.featuredImage) : null;
  return (
    <Link href={href} className="group my-6 flex overflow-hidden rounded-xl border border-border bg-white hover:border-primary">
      {img ? (
        <Image src={img.src} width={img.width} height={img.height} alt="" sizes="160px"
          className="w-28 shrink-0 object-cover sm:w-40" />
      ) : null}
      <span className="flex min-w-0 flex-col justify-center gap-1 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Related guide</span>
        <span className="font-heading font-semibold leading-snug text-text-primary group-hover:text-primary">{node.fm.title}</span>
        <span className="line-clamp-2 text-sm text-text-secondary">{node.fm.description}</span>
      </span>
    </Link>
  );
}
