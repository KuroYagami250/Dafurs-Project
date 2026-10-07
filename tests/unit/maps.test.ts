import { describe, expect, it } from "vitest";
import { mapsEmbedUrl, mapsLinkUrl } from "@/lib/maps";

describe("maps urls", () => {
  const query = "Angel Coffee, 87 Quang Trung, Hải Châu, Đà Nẵng";

  it("encodes Vietnamese text and commas in the embed url", () => {
    const url = new URL(mapsEmbedUrl(query));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.searchParams.get("q")).toBe(query);
    expect(url.searchParams.get("output")).toBe("embed");
  });

  it("builds a Google Maps search link", () => {
    const url = new URL(mapsLinkUrl(query));
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe(query);
  });
});
