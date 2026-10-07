import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { comingSoonFeatures, featureLabel, isComingSoonFeature } from "@/lib/nav";

// Temporary pages for features that are not built yet.
// When a real feature ships, create app/[lang]/<feature>/page.tsx: a static
// segment wins over this dynamic one. Then remove it from comingSoonFeatures.
// Only the params returned below exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return comingSoonFeatures.map((feature) => ({ feature }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[feature]">): Promise<Metadata> {
  const { lang, feature } = await params;
  if (!hasLocale(lang) || !isComingSoonFeature(feature)) return {};
  const dict = getDictionary(lang);
  return { title: `${featureLabel(feature, dict.nav)} · ${dict.meta.title}`, robots: { index: false } };
}

export default async function ComingSoonPage({ params }: PageProps<"/[lang]/[feature]">) {
  const { lang, feature } = await params;
  if (!hasLocale(lang) || !isComingSoonFeature(feature)) notFound();
  const dict = getDictionary(lang);

  return <ComingSoon locale={lang} title={featureLabel(feature, dict.nav)} soon={dict.soon} badge={dict.nav.soonBadge} />;
}
