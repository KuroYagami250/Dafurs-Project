import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/lexend";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { eventConfig } from "@/content/event";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, locales } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

// Only the params returned below exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: getSiteUrl(),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    icons: { icon: "/images/dafur-logo.png" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className="antialiased">
      <body className="flex min-h-screen flex-col font-sans">
        <div className="relative flex-1">
          <SiteHeader locale={lang} nav={dict.nav} />
          <main>{children}</main>
        </div>
        <SiteFooter footer={dict.footer} facebookUrl={eventConfig.facebookUrl} />
      </body>
    </html>
  );
}
