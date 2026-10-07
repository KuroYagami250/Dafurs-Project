import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoon } from "@/components/ComingSoon";
import { getDictionary } from "@/lib/dictionaries";

const enDict = getDictionary("en");

describe("ComingSoon", () => {
  it("shows the feature title and a link back home", () => {
    render(<ComingSoon locale="en" title="Tickets" soon={enDict.soon} badge={enDict.nav.soonBadge} />);
    expect(screen.getByRole("heading", { level: 1, name: "Tickets" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to home/ })).toHaveAttribute("href", "/en");
  });
});
