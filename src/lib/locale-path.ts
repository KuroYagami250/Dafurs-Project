import { hasLocale, type Locale } from "./i18n";

/**
 * Swap (or insert) the locale segment of a pathname.
 * "/vi/tickets" -> "/en/tickets", "/" -> "/en", "/tickets" -> "/en/tickets"
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && hasLocale(segments[1])) {
    segments[1] = target;
  } else {
    segments.splice(1, 0, target);
  }
  const joined = segments.join("/").replace(/\/+$/, "");
  return joined === "" ? `/${target}` : joined;
}
