import type { ReactNode } from "react";

/**
 * Sources and image credits, closed by default at the very foot of the page.
 * CC BY and CC BY-SA require the credit on the page that shows the photo, and
 * the editorial policy promises sources, so both stay in the page. They only
 * need to be findable, not to compete with what the reader reads next.
 */
export default function SourcesDisclosure({ count, children }: { count: number; children: ReactNode }) {
  return (
    <details className="mt-12 text-sm text-text-secondary">
      <summary className="cursor-pointer select-none">
        {count > 0 ? `Sources (${count}) and image credits` : "Image credits"}
      </summary>
      {children}
    </details>
  );
}
