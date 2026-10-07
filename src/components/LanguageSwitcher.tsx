"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/locale-path";

type Props = { locale: Locale; label: string };

export function LanguageSwitcher({ locale, label }: Props) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <details className="group relative">
      <summary
        aria-label={label}
        className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 font-semibold text-white [&::-webkit-details-marker]:hidden"
      >
        {localeLabels[locale].short}
        <span aria-hidden className="text-xs transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 min-w-36 overflow-hidden rounded-xl bg-white py-1 text-ink shadow-lg">
        {locales.map((target) => (
          <li key={target}>
            <Link
              href={switchLocalePath(pathname, target)}
              hrefLang={target}
              aria-current={target === locale ? "true" : undefined}
              className="block px-4 py-2 hover:bg-sand aria-[current=true]:font-bold"
            >
              {localeLabels[target].name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
