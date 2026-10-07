import type { Locale } from "./i18n";
import type { Dictionary } from "./dictionaries";

export const comingSoonFeatures = ["tickets", "talent", "gallery", "login"] as const;

export type ComingSoonFeature = (typeof comingSoonFeatures)[number];

export function isComingSoonFeature(value: string): value is ComingSoonFeature {
  return (comingSoonFeatures as readonly string[]).includes(value);
}

export type NavItem = {
  key: "tickets" | "talent" | "gallery" | "about";
  label: string;
  href: string;
  soon: boolean;
};

export function getNavItems(locale: Locale, nav: Dictionary["nav"]): NavItem[] {
  return [
    { key: "tickets", label: nav.tickets, href: `/${locale}/tickets`, soon: true },
    { key: "talent", label: nav.talent, href: `/${locale}/talent`, soon: true },
    { key: "gallery", label: nav.gallery, href: `/${locale}/gallery`, soon: true },
    { key: "about", label: nav.about, href: `/${locale}#about`, soon: false },
  ];
}

export function featureLabel(feature: ComingSoonFeature, nav: Dictionary["nav"]): string {
  return nav[feature];
}
