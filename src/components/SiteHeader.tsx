import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { getNavItems } from "@/lib/nav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SoonBadge } from "./SoonBadge";

type Props = { locale: Locale; nav: Dictionary["nav"] };

export function SiteHeader({ locale, nav }: Props) {
  const items = getNavItems(locale, nav);
  const loginHref = `/${locale}/login`;

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href={`/${locale}`} aria-label={nav.home} className="shrink-0">
          <Image src="/images/dafur-logo.png" alt="" width={119} height={82} priority className="h-12 w-auto md:h-16" />
        </Link>

        <nav aria-label={nav.mainNav} className="hidden md:block">
          <ul className="flex items-center gap-6 lg:gap-10">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="font-semibold uppercase text-white underline decoration-2 underline-offset-8 drop-shadow hover:text-aqua-soft"
                >
                  {item.label}
                </Link>
                {item.soon && <SoonBadge label={nav.soonBadge} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={nav.language} />
          <Link
            href={loginHref}
            className="hidden rounded-full bg-aqua px-5 py-2.5 font-bold text-ink shadow hover:bg-aqua-soft md:inline-block"
          >
            {nav.login} →
          </Link>
          <MobileMenu
            items={items}
            loginHref={loginHref}
            labels={{ openMenu: nav.openMenu, closeMenu: nav.closeMenu, login: nav.login, soonBadge: nav.soonBadge }}
          />
        </div>
      </div>
    </header>
  );
}
