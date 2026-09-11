export default function Verdict({ children }: { children: React.ReactNode }) {
  return (
    <section aria-label="Verdict" className="my-6 rounded-xl border-2 border-primary px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">The short verdict</p>
      <div className="mt-1 text-text-primary">{children}</div>
    </section>
  );
}
