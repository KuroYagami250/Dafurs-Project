import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary } from "@/lib/dictionaries";
import { getNavItems } from "@/lib/nav";

const pathname = vi.hoisted(() => ({ current: "/vi/tickets" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const viDict = getDictionary("vi");
const enDict = getDictionary("en");

describe("SiteHeader", () => {
  it("shows the four nav links with coming-soon badges on unbuilt ones", () => {
    render(<SiteHeader locale="vi" nav={viDict.nav} />);
    const nav = screen.getByRole("navigation", { name: "Điều hướng chính" });
    expect(within(nav).getByRole("link", { name: "Vé" })).toHaveAttribute("href", "/vi/tickets");
    expect(within(nav).getByRole("link", { name: "Giới thiệu" })).toHaveAttribute("href", "/vi#about");
    expect(within(nav).getAllByText("Sắp ra mắt")).toHaveLength(3);
  });

  it("links the logo home and the login button to the login page", () => {
    render(<SiteHeader locale="en" nav={enDict.nav} />);
    expect(screen.getByRole("link", { name: "DaFur, back to home" })).toHaveAttribute("href", "/en");
    expect(screen.getAllByRole("link", { name: /Log in/ })[0]).toHaveAttribute("href", "/en/login");
  });
});

describe("LanguageSwitcher", () => {
  it("keeps the current page when switching language", () => {
    pathname.current = "/vi/tickets";
    render(<LanguageSwitcher locale="vi" label="Ngôn ngữ" />);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/tickets");
    expect(screen.getByRole("link", { name: "Tiếng Việt" })).toHaveAttribute("aria-current", "true");
  });
});

describe("MobileMenu", () => {
  const labels = {
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    login: "Đăng nhập",
    soonBadge: "Sắp ra mắt",
    mainNav: "Điều hướng chính",
  };

  it("opens, closes with Escape and closes after choosing a link", () => {
    render(<MobileMenu items={getNavItems("vi", viDict.nav)} loginHref="/vi/login" labels={labels} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đóng menu" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    fireEvent.click(screen.getByRole("link", { name: /Giới thiệu/ }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("LanguageSwitcher closing", () => {
  function openSwitcher() {
    const utils = render(<LanguageSwitcher locale="vi" label="Ngôn ngữ" />);
    const details = utils.container.querySelector("details")!;
    details.open = true;
    return { ...utils, details };
  }

  it("closes on Escape", () => {
    const { details } = openSwitcher();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(details.open).toBe(false);
  });

  it("closes on a pointer press outside it", () => {
    const { details } = openSwitcher();
    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);
  });

  it("stays open on a pointer press inside it", () => {
    const { details } = openSwitcher();
    fireEvent.pointerDown(screen.getByRole("link", { name: "English" }));
    expect(details.open).toBe(true);
  });

  it("closes after choosing a language", () => {
    const { details } = openSwitcher();
    fireEvent.click(screen.getByRole("link", { name: "Tiếng Việt" }));
    expect(details.open).toBe(false);
  });

  it("closes when the page changes", () => {
    pathname.current = "/vi";
    const { details, rerender } = openSwitcher();
    pathname.current = "/vi/tickets";
    rerender(<LanguageSwitcher locale="vi" label="Ngôn ngữ" />);
    expect(details.open).toBe(false);
  });
});

describe("MobileMenu outside press", () => {
  it("closes when pressing outside the menu", () => {
    render(
      <MobileMenu
        items={getNavItems("vi", viDict.nav)}
        loginHref="/vi/login"
        labels={{ openMenu: "Mở menu", closeMenu: "Đóng menu", login: "Đăng nhập", soonBadge: "Sắp ra mắt", mainNav: "Điều hướng chính" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("hides the Facebook button when no URL is configured", () => {
    render(<SiteFooter footer={viDict.footer} facebookUrl="" />);
    expect(screen.getByText("(C) DaFur 2026")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the Facebook button when a URL is configured", () => {
    render(<SiteFooter footer={viDict.footer} facebookUrl="https://www.facebook.com/example" />);
    expect(screen.getByRole("link", { name: viDict.footer.facebook })).toHaveAttribute(
      "href",
      "https://www.facebook.com/example",
    );
  });
});
