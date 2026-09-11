export default function FAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-bold">Frequently asked questions</h2>
      {faqs.map((f) => (
        <div key={f.q} className="mt-6">
          <h3 className="font-heading text-lg font-semibold">{f.q}</h3>
          <p className="mt-2 text-text-primary">{f.a}</p>
        </div>
      ))}
    </section>
  );
}
