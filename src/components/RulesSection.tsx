import type { Dictionary } from "@/lib/dictionaries";

type Props = { rules: Dictionary["rules"] };

export function RulesSection({ rules }: Props) {
  return (
    <section aria-labelledby="rules-title" className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <h2 id="rules-title" className="text-3xl font-extrabold uppercase text-balance text-sea md:text-4xl">
        {rules.heading}
      </h2>
      <p className="mt-4 max-w-[44rem] font-medium">{rules.intro}</p>
      <ul className="mt-6 max-w-[44rem] list-disc space-y-3 pl-6 leading-relaxed marker:text-sea">
        {rules.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-10 max-w-4xl text-2xl font-bold leading-snug text-balance text-sea md:text-3xl">{rules.closing}</p>
    </section>
  );
}
