import AdUnit from "./AdUnit";

const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE;

export default function InArticleAd({ className }: { className?: string }) {
  if (!SLOT) return null;
  return (
    <AdUnit
      slot={SLOT}
      format="fluid"
      layout="in-article"
      className={className}
    />
  );
}
