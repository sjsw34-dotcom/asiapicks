export default function AnswerBox({ summary }: { summary: string }) {
  return (
    <section aria-label="Short answer" className="my-6 rounded-xl border-l-4 border-primary bg-teal-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Short answer</p>
      <p className="mt-1 text-base text-text-primary">{summary}</p>
    </section>
  );
}
