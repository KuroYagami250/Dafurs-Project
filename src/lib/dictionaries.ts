import vi from "@/content/vi.json";
import en from "@/content/en.json";
import type { Locale } from "./i18n";

export type Dictionary = typeof vi;

// Typing `en` as Dictionary makes the build fail if en.json is missing a key from vi.json.
const dictionaries: Record<Locale, Dictionary> = { vi, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
