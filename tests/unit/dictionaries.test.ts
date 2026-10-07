import { describe, expect, it } from "vitest";
import vi from "@/content/vi.json";
import en from "@/content/en.json";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// Describe the shape of a JSON value: object keys, array lengths and leaf types.
function shape(value: Json, path = "$"): string[] {
  if (Array.isArray(value)) {
    return [`${path}[len=${value.length}]`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))];
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .flatMap((key) => shape(value[key], `${path}.${key}`));
  }
  return [`${path}:${typeof value}`];
}

function emptyStrings(value: Json, path = "$"): string[] {
  if (typeof value === "string") return value.trim() === "" ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((item, i) => emptyStrings(item, `${path}[${i}]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => emptyStrings(item, `${path}.${key}`));
  }
  return [];
}

describe("content dictionaries", () => {
  it("vi.json and en.json have exactly the same keys, list lengths and types", () => {
    expect(shape(en as Json)).toEqual(shape(vi as Json));
  });

  it("has no empty text in either language", () => {
    expect(emptyStrings(vi as Json)).toEqual([]);
    expect(emptyStrings(en as Json)).toEqual([]);
  });

  it("getDictionary returns the matching language", () => {
    expect(getDictionary("vi").nav.tickets).toBe("Vé");
    expect(getDictionary("en").nav.tickets).toBe("Tickets");
  });
});

describe("eventConfig", () => {
  it("facebookUrl is empty or an https URL", () => {
    const url: string = eventConfig.facebookUrl;
    if (url !== "") expect(url).toMatch(/^https:\/\//);
  });

  it("has a maps query", () => {
    expect(eventConfig.mapsQuery.trim()).not.toBe("");
  });
});
