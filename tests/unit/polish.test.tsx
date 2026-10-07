import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComingSoon } from "@/components/ComingSoon";
import { Hero } from "@/components/Hero";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VenueSection } from "@/components/VenueSection";
import { getDictionary } from "@/lib/dictionaries";
import { getNavItems } from "@/lib/nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/vi" }));

const viDict = getDictionary("vi");
const enDict = getDictionary("en");

// Typed glyphs (→ ↗ ← ☰ ✕ ▾) render differently per platform font; icons must be SVGs hidden from screen readers.
const glyphs = /[→↗←☰✕▾]/;

function expectNoGlyphs(container: HTMLElement) {
  expect(container.textContent).not.toMatch(glyphs);
}

function expectDecorativeSvg(element: HTMLElement) {
  const svg = element.querySelector("svg");
  expect(svg).not.toBeNull();
  expect(svg).toHaveAttribute("aria-hidden", "true");
}

describe("icons instead of typed glyphs", () => {
  it("hero ticket CTA is named only by its text and carries an svg arrow", () => {
    const { container } = render(<Hero locale="vi" hero={viDict.hero} />);
    const cta = screen.getByRole("link", { name: "Mua vé" });
    expectDecorativeSvg(cta);
    expectNoGlyphs(container);
  });

  it("header login pill uses an svg arrow", () => {
    const { container } = render(<SiteHeader locale="vi" nav={viDict.nav} />);
    expectDecorativeSvg(screen.getAllByRole("link", { name: "Đăng nhập" })[0]);
    expectNoGlyphs(container);
  });

  it("language switcher caret is an svg", () => {
    const { container } = render(<LanguageSwitcher locale="vi" label="Ngôn ngữ" />);
    expectDecorativeSvg(container.querySelector("summary") as HTMLElement);
    expectNoGlyphs(container);
  });

  it("mobile menu toggle is an svg icon", () => {
    const labels = { openMenu: "Mở menu", closeMenu: "Đóng menu", login: "Đăng nhập", soonBadge: "Sắp ra mắt", mainNav: "Điều hướng chính" };
    const { container } = render(<MobileMenu items={getNavItems("vi", viDict.nav)} loginHref="/vi/login" labels={labels} />);
    expectDecorativeSvg(screen.getByRole("button", { name: "Mở menu" }));
    expectNoGlyphs(container);
  });

  it("maps link and coming-soon back link use svg arrows", () => {
    const venue = render(<VenueSection venue={viDict.venue} mapsQuery="Angel Coffee" />);
    expectDecorativeSvg(screen.getByRole("link", { name: "Mở trong Google Maps" }));
    expectNoGlyphs(venue.container);
    venue.unmount();

    const soon = render(<ComingSoon locale="en" title="Tickets" soon={enDict.soon} badge={enDict.nav.soonBadge} />);
    expectDecorativeSvg(screen.getByRole("link", { name: "Back to home" }));
    expectNoGlyphs(soon.container);
  });

  it("footer Facebook button uses the icon library logo", () => {
    render(<SiteFooter footer={viDict.footer} facebookUrl="https://facebook.com/dafur" />);
    const link = screen.getByRole("link", { name: viDict.footer.facebook });
    expectDecorativeSvg(link);
    // Phosphor icons render a 256-unit viewBox; the old hand-drawn path used 24.
    expect(link.querySelector("svg")).toHaveAttribute("viewBox", "0 0 256 256");
  });
});
