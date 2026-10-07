import type { Dictionary } from "@/lib/dictionaries";

type Props = { rules: Dictionary["rules"] };

export function RulesSection({ rules }: Props) {
  return (
    <section aria-labelledby="rules-title" className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <h2 id="rules-title" className="text-3xl font-extrabold uppercase text-sea md:text-4xl">
        {rules.heading}
      </h2>
      <p className="mt-4 font-medium">{rules.intro}</p>
      <ul className="mt-6 list-disc space-y-3 pl-6 leading-relaxed">
        {rules.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-10 text-2xl font-bold leading-snug text-sea md:text-3xl">{rules.closing}</p>
    </section>
  );
}
