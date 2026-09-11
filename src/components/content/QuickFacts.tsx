export default function QuickFacts({ title = "Quick facts", children }: { title?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="my-6 rounded-xl border border-border px-5 py-4">
      <p className="font-heading text-base font-semibold">{title}</p>
      <div className="mt-2 text-sm [&_ul]:space-y-1">{children}</div>
    </section>
  );
}
