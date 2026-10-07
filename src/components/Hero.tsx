import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { locale: Locale; hero: Dictionary["hero"] };

export function Hero({ locale, hero }: Props) {
  return (
    // The artwork is 1366x1194 and fades out through a transparent wavy edge below y=1094. Keeping the hero at
    // least 80% as tall as it is wide shows the whole beach at every width; the board then hangs over the sand.
    <section className="relative isolate flex flex-col items-center overflow-hidden px-4 pb-36 pt-28 text-center md:min-h-[80vw] md:pb-48 md:pt-32">
      <Image
        src="/images/beach-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <p className="font-semibold text-white text-shadow-md text-shadow-sea-deep/70 md:text-lg">{hero.date}</p>
      <p className="mt-1 text-sm font-medium text-white text-shadow-md text-shadow-sea-deep/70 md:text-base">{hero.venue}</p>

      <h1 className="mt-6 w-full max-w-[640px]">
        <Image
          src="/images/event-logo.png"
          alt={hero.logoAlt}
          width={615}
          height={372}
          priority
          sizes="(min-width: 768px) 640px, 92vw"
          className="h-auto w-full"
        />
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}/tickets`}
          className="inline-flex items-center gap-2 rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-cta transition-colors hover:bg-aqua-soft active:translate-y-px"
        >
          {hero.buyTicket}
          <ArrowRightIcon aria-hidden weight="bold" className="size-4" />
        </Link>
        <Link
          href={`/${locale}#about`}
          className="rounded-full bg-white px-6 py-3 font-bold text-ink shadow-cta transition-colors hover:bg-sand active:translate-y-px"
        >
          {hero.eventInfo}
        </Link>
      </div>
    </section>
  );
}
