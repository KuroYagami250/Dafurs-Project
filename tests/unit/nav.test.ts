import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/dictionaries";
import { comingSoonFeatures, featureLabel, getNavItems, isComingSoonFeature } from "@/lib/nav";

describe("getNavItems", () => {
  it("builds locale-prefixed links and marks unbuilt features as soon", () => {
    const items = getNavItems("en", getDictionary("en").nav);
    expect(items).toEqual([
      { key: "tickets", label: "Tickets", href: "/en/tickets", soon: true },
      { key: "talent", label: "Talent sign-up", href: "/en/talent", soon: true },
      { key: "gallery", label: "Gallery", href: "/en/gallery", soon: true },
      { key: "about", label: "About", href: "/en#about", soon: false },
    ]);
  });
});

describe("coming soon features", () => {
  it("lists the four unbuilt features", () => {
    expect(comingSoonFeatures).toEqual(["tickets", "talent", "gallery", "login"]);
  });

  it("recognises only those features", () => {
    expect(isComingSoonFeature("login")).toBe(true);
    expect(isComingSoonFeature("about")).toBe(false);
    expect(isComingSoonFeature("Tickets")).toBe(false);
  });

  it("labels each feature from the nav dictionary", () => {
    const nav = getDictionary("vi").nav;
    expect(comingSoonFeatures.map((f) => featureLabel(f, nav))).toEqual(["Vé", "Đăng ký tài năng", "Ảnh", "Đăng nhập"]);
  });
});
