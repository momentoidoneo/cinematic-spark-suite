type FAQ = { question: string; answer: string };
export default function ServiceFAQ({ items, title }: { items: FAQ[]; title: string }) {
  return <section className="py-16 px-6" aria-label={title}>
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl font-bold mb-8">{title}</h2>
      <div className="space-y-3">
        {items.map(item => <details key={item.question} className="rounded-xl border border-border bg-card p-5">
          <summary className="cursor-pointer font-semibold">{item.question}</summary>
          <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
