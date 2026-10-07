export const locales = ["vi", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const localeLabels: Record<Locale, { short: string; name: string }> = {
  vi: { short: "VN", name: "Tiếng Việt" },
  en: { short: "EN", name: "English" },
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
