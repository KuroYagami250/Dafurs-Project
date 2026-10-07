import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementBoard } from "@/components/AnnouncementBoard";
import { Hero } from "@/components/Hero";
import { RulesSection } from "@/components/RulesSection";
import { VenueSection } from "@/components/VenueSection";
import { getDictionary } from "@/lib/dictionaries";

const viDict = getDictionary("vi");
const enDict = getDictionary("en");

describe("landing sections", () => {
  it("Hero shows the date, the logo as the page heading and both CTAs", () => {
    render(<Hero locale="vi" hero={viDict.hero} />);
    expect(screen.getByText("Ngày 30 Tháng 8 Năm 2026")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toContainElement(screen.getByAltText("Paws Of Summer, DaFur 2026"));
    expect(screen.getByRole("link", { name: /Mua vé/ })).toHaveAttribute("href", "/vi/tickets");
    expect(screen.getByRole("link", { name: "Thông tin sự kiện" })).toHaveAttribute("href", "/vi#about");
  });

  it("AnnouncementBoard is the #about target and renders every paragraph", () => {
    const { container } = render(<AnnouncementBoard announcement={viDict.announcement} />);
    expect(container.querySelector("section#about")).not.toBeNull();
    for (const paragraph of viDict.announcement.paragraphs) expect(screen.getByText(paragraph)).toBeInTheDocument();
  });

  it("VenueSection lists details and embeds the map for the query", () => {
    render(<VenueSection venue={viDict.venue} mapsQuery="Angel Coffee" />);
    expect(screen.getByText("28.000 VNĐ / người")).toBeInTheDocument();
    expect(screen.getByTitle(viDict.venue.mapTitle)).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=Angel%20Coffee&output=embed",
    );
    expect(screen.getByRole("link", { name: /Mở trong Google Maps/ })).toHaveAttribute("target", "_blank");
  });

  it("RulesSection renders every rule and the closing line", () => {
    render(<RulesSection rules={enDict.rules} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(enDict.rules.items.length);
    expect(screen.getByText(enDict.rules.closing)).toBeInTheDocument();
  });
});
