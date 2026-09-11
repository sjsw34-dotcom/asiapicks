const LABELS = { tip: "Tip", pick: "Our pick", note: "Note" } as const;

export default function Callout({ type = "note", title, children }: { type?: keyof typeof LABELS; title?: string; children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-xl border border-border bg-surface px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">{LABELS[type] ?? LABELS.note}{title ? `: ${title}` : ""}</p>
      <div className="mt-1 text-text-primary [&>p]:my-1">{children}</div>
    </aside>
  );
}
