import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { SoonBadge } from "./SoonBadge";

type Props = { locale: Locale; title: string; soon: Dictionary["soon"]; badge: string };

export function ComingSoon({ locale, title, soon, badge }: Props) {
  return (
    <section className="flex min-h-[calc(100svh-5.5rem)] flex-col items-center justify-center bg-gradient-to-b from-sea-deep via-sea-light to-sand px-4 pb-16 pt-32 text-center">
      <SoonBadge label={badge} />
      <h1 className="mt-4 text-4xl font-extrabold text-white drop-shadow md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-lg text-ink">{soon.body}</p>
      <Link href={`/${locale}`} className="mt-8 rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-md hover:bg-aqua-soft">
        ← {soon.back}
      </Link>
    </section>
  );
}
