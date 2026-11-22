import type { Metadata } from "next"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { OfferCard } from "@/components/offers/offer-card"
import { OffersBanner } from "@/components/offers/offers-banner"
import { OffersBrowser } from "@/components/offers/offers-browser"
import { OffersHero } from "@/components/offers/offers-hero"
import { SectionHeading } from "@/components/ui/section-heading"
import { getOffers, getOffersPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const GRID_ID = "offers"

function fallbackDescription(brandName: string) {
  return `Current offers and seasonal packages at ${brandName} across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const [page, offers] = await Promise.all([getOffersPage(fallbackDescription(settings.brandName)), getOffers()])
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/offers",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? offers[0]?.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Every live offer, ending soonest first, with category filters and a closing banner. */
export default async function OffersPage() {
  const settings = await getSiteSettings()
  const [page, offers] = await Promise.all([getOffersPage(fallbackDescription(settings.brandName)), getOffers()])

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <OffersHero hero={page.hero} targetId={GRID_ID} />

      <OffersBrowser
        id={GRID_ID}
        offers={offers.map((offer) => ({
          slug: offer.slug,
          category: offer.category,
          card: <OfferCard offer={offer} />,
        }))}
        heading={
          <SectionHeading
            id={`${GRID_ID}-title`}
            title="Our Exclusive Offers"
            subtitle="Unforgettable experiences at exceptional value"
          />
        }
        empty={
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <p className="text-body text-charcoal">There are no offers running right now.</p>
            <BookStayLink source="offers-empty" />
          </div>
        }
      />

      {page.banner ? <OffersBanner banner={page.banner} /> : null}
    </main>
  )
}
