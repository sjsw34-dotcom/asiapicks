import type { MDXComponents } from "mdx/types";
import AffiliateCTA from "@/components/affiliate/AffiliateCTA";

/**
 * Custom MDX component mapping.
 * - Overrides default HTML elements with styled versions
 * - Exposes <AffiliateCTA /> for direct use inside MDX content
 */
export function getMDXComponents(): MDXComponents {
  return {
    // ── Typography ──────────────────────────────────
    h2: ({ children, ...props }) => (
      <h2
        className="mt-10 mb-4 text-2xl font-bold font-heading text-text-primary scroll-mt-20"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="mt-7 mb-3 text-xl font-semibold font-heading text-text-primary scroll-mt-20"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="my-4 text-text-primary leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-4 ml-5 space-y-1.5 list-disc text-text-primary">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-5 space-y-1.5 list-decimal text-text-primary">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-text-primary">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 text-text-secondary italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-border" />,

    // ── Code ────────────────────────────────────────
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-surface text-sm font-mono text-accent border border-border">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-xl bg-slate-900 text-slate-100 p-5 text-sm leading-relaxed">
        {children}
      </pre>
    ),

    // ── Links & Images ───────────────────────────────
    a: ({ href, children }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-primary underline underline-offset-2 hover:text-primary-dark transition-colors"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className="my-6 w-full rounded-xl object-cover"
        loading="lazy"
      />
    ),

    // ── Table ────────────────────────────────────────
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left font-semibold text-text-primary border-b border-border">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 text-text-secondary border-b border-border">
        {children}
      </td>
    ),

    // ── Custom Components (usable directly in MDX) ───
    AffiliateCTA,
  };
}
