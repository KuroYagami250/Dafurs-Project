import { notFound } from "next/navigation";
import { AnnouncementBoard } from "@/components/AnnouncementBoard";
import { Hero } from "@/components/Hero";
import { RulesSection } from "@/components/RulesSection";
import { VenueSection } from "@/components/VenueSection";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Hero locale={lang} hero={dict.hero} />
      <AnnouncementBoard announcement={dict.announcement} />
      <VenueSection venue={dict.venue} mapsQuery={eventConfig.mapsQuery} />
      <RulesSection rules={dict.rules} />
    </>
  );
}
