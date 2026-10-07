"use client";

import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { locales, localeLabels, type Locale } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/locale-path";

type Props = { locale: Locale; label: string };

export function LanguageSwitcher({ locale, label }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  // The header stays mounted across pages, so close the menu whenever the page changes.
  useEffect(close, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        aria-label={label}
        className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 font-semibold text-white text-shadow-sm text-shadow-sea-deep/60 [&::-webkit-details-marker]:hidden"
      >
        {localeLabels[locale].short}
        <CaretDownIcon aria-hidden weight="bold" className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute right-0 z-20 mt-2 min-w-36 overflow-hidden rounded-2xl bg-white py-1 text-ink shadow-card">
        {locales.map((target) => (
          <li key={target}>
            <Link
              href={switchLocalePath(pathname, target)}
              hrefLang={target}
              aria-current={target === locale ? "true" : undefined}
              onClick={close}
              className="block px-4 py-2.5 transition-colors -outline-offset-3 hover:bg-sand aria-[current=true]:font-bold"
            >
              {localeLabels[target].name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
