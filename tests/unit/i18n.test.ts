import { describe, expect, it } from "vitest";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/locale-path";

describe("hasLocale", () => {
  it("accepts supported locales", () => {
    expect(hasLocale("vi")).toBe(true);
    expect(hasLocale("en")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
    expect(hasLocale("VI")).toBe(false);
  });

  it("has vi as default and first locale", () => {
    expect(defaultLocale).toBe("vi");
    expect(locales[0]).toBe("vi");
  });
});

describe("switchLocalePath", () => {
  it.each([
    ["/vi", "en", "/en"],
    ["/en", "vi", "/vi"],
    ["/vi/tickets", "en", "/en/tickets"],
    ["/vi/", "en", "/en"],
    ["/", "en", "/en"],
    ["", "en", "/en"],
    ["/tickets", "en", "/en/tickets"],
    ["/en/tickets", "en", "/en/tickets"],
  ] as const)("%s -> %s gives %s", (pathname, target, expected) => {
    expect(switchLocalePath(pathname, target)).toBe(expected);
  });
});
