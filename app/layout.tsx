import { Suspense } from "react";
import type { Metadata } from "next";
import { OfferPopup } from "@/components/offers/offer-popup";
import { Lato, Playfair_Display } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { ConsentBanner } from "@/components/site/consent-banner";
import { analyticsEnabled } from "@/lib/analytics/posthog";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteSettings } from "@/lib/content";
import { ogImage } from "@/lib/content/og";
import { organizationJsonLd } from "@/lib/seo/json-ld";
import { OG_LOCALE } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
});

// Accent taglines only, always below the fold: not preloaded, swaps in.
const playfairItalic = Playfair_Display({
  variable: "--font-playfair-italic",
  subsets: ["latin"],
  style: "italic",
  display: "swap",
  preload: false,
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  // 300 was loaded but never used; only regular and bold are in the design.
  weight: ["400", "700"],
  display: "swap",
});

/** Site-wide defaults from Site settings → Default SEO; pages override them. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo, brandName } = await getSiteSettings();
  const description = seo.description || undefined;
  const images = seo.image ? ogImage(seo.image) : undefined;

  return {
    // A string, not a URL: metadata values must be serialisable.
    metadataBase: siteUrl(),
    title: { default: seo.title, template: `%s | ${brandName}` },
    description,
    openGraph: { type: "website", locale: OG_LOCALE, siteName: brandName, title: seo.title, description, images },
    twitter: { card: "summary_large_image" },
  };
}

/** Organization structured data, on every page. */
async function OrganizationJsonLd() {
  const settings = await getSiteSettings();
  return <JsonLd data={organizationJsonLd(settings, siteUrl())} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${playfairItalic.variable} ${lato.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-forest px-4 py-3 text-small font-bold text-ivory focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Suspense fallback={null}>
          <OfferPopup />
        </Suspense>
        {analyticsEnabled() ? <ConsentBanner /> : null}
      </body>
    </html>
  );
}
