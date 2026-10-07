import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { locale: Locale; hero: Dictionary["hero"] };

export function Hero({ locale, hero }: Props) {
  return (
    <section className="relative isolate flex min-h-[580px] flex-col items-center overflow-hidden bg-sand px-4 pb-16 pt-28 text-center md:min-h-[760px] md:pb-24 md:pt-32">
      <Image
        src="/images/beach-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <p className="font-semibold text-white drop-shadow md:text-lg">{hero.date}</p>
      <p className="mt-1 text-sm text-white drop-shadow md:text-base">{hero.venue}</p>

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
          className="rounded-full bg-aqua px-8 py-3 font-bold text-ink shadow-md hover:bg-aqua-soft"
        >
          {hero.buyTicket} →
        </Link>
        <Link
          href={`/${locale}#about`}
          className="rounded-full bg-white px-6 py-3 font-bold text-ink shadow-md hover:bg-sand"
        >
          {hero.eventInfo}
        </Link>
      </div>
    </section>
  );
}
