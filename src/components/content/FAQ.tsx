import { faqId } from "@/lib/search/query";

export default function FAQ({ faqs, collapsible = false }: { faqs: { q: string; a: string }[]; collapsible?: boolean }) {
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="mt-12">
      <h2 className="font-heading text-2xl font-bold">Frequently asked questions</h2>
      {faqs.map((f) => collapsible ? (
        <details key={f.q} id={faqId(f.q)} className="mt-4 scroll-mt-4 border-b border-border pb-4">
          <summary className="cursor-pointer py-2 font-heading text-base font-semibold">
            {f.q}
          </summary>
          <p className="mt-2 leading-relaxed text-text-primary">{f.a}</p>
        </details>
      ) : (
        <div key={f.q} id={faqId(f.q)} className="mt-6 scroll-mt-4">
          <h3 className="font-heading text-lg font-semibold">{f.q}</h3>
          <p className="mt-2 text-text-primary">{f.a}</p>
        </div>
      ))}
    </section>
  );
}
