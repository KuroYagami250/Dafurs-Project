import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { SoonBadge } from "./SoonBadge";

type Props = { locale: Locale; title: string; soon: Dictionary["soon"]; badge: string };

export function ComingSoon({ locale, title, soon, badge }: Props) {
  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center bg-gradient-to-b from-sea-deep via-sea-light to-sand px-4 pb-16 pt-32 text-center">
      <SoonBadge label={badge} />
      <h1 className="mt-4 text-4xl font-extrabold text-white text-shadow-md text-shadow-sea-deep/60 md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-lg text-ink">{soon.body}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-cta transition-colors hover:bg-aqua-soft active:translate-y-px"
      >
        <ArrowLeftIcon aria-hidden weight="bold" className="size-4" />
        {soon.back}
      </Link>
    </section>
  );
}
