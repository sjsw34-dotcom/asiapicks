import { getSajumuseLink } from "@/lib/affiliates";

interface SajuInsightBoxProps {
  text?: string;
  campaign?: string;
}

const DEFAULT_TEXT =
  "Your birth elements hold the key to your perfect travel destination. Discover which Asian city aligns with your Wood, Fire, Earth, Metal, or Water energy.";

export default function SajuInsightBox({
  text = DEFAULT_TEXT,
  campaign = "insight-box",
}: SajuInsightBoxProps) {
  const href = getSajumuseLink(campaign);

  return (
    <aside className="rounded-xl overflow-hidden my-8">
      <div className="bg-gradient-to-r from-accent to-accent-dark p-6 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0" aria-hidden="true">🔮</span>
          <div>
            <h3 className="font-semibold font-heading text-lg">
              What does your Saju say about your travels?
            </h3>
            <p className="mt-1 text-sm text-white/80 leading-relaxed">{text}</p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-accent font-medium text-sm hover:bg-white/90 transition-colors"
            >
              Discover Your Travel Destiny →
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
