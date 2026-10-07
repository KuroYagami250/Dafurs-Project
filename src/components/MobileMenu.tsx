"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/nav";
import { SoonBadge } from "./SoonBadge";

type Props = {
  items: NavItem[];
  loginHref: string;
  labels: { openMenu: string; closeMenu: string; login: string; soonBadge: string; mainNav: string };
};

export function MobileMenu({ items, loginHref, labels }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white"
      >
        <span aria-hidden>{open ? "✕" : "☰"}</span>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label={labels.mainNav}
          className="absolute inset-x-4 top-full z-30 mt-2 rounded-2xl bg-white p-4 text-ink shadow-xl"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} onClick={close} className="block rounded-lg px-3 py-3 font-semibold hover:bg-sand">
                  {item.label}
                  {item.soon && <SoonBadge label={labels.soonBadge} />}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={loginHref}
                onClick={close}
                className="mt-2 block rounded-full bg-aqua px-4 py-3 text-center font-bold text-ink"
              >
                {labels.login} →
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
