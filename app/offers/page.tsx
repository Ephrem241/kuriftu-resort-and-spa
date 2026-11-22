import type { Metadata } from "next"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { OfferCard } from "@/components/offers/offer-card"
import { getOffers, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const TITLE = "Special Offers"

export async function generateMetadata(): Promise<Metadata> {
  const [settings, offers] = await Promise.all([getSiteSettings(), getOffers()])
  return pageMetadata({
    title: TITLE,
    description: `Current offers and seasonal packages at ${settings.brandName} across Ethiopia.`,
    path: "/offers",
    siteName: settings.brandName,
    image: offers[0]?.image ?? settings.seo.image,
  })
}

/** Every live offer, ending soonest first. */
export default async function OffersPage() {
  const offers = await getOffers()

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <section aria-labelledby="offers-title" className="container-site pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="text-center">
          <p className="eyebrow text-forest">Kuriftu Resorts &amp; Spa</p>
          <h1 id="offers-title" className="mt-3 text-h1">
            {TITLE}
          </h1>
          <div aria-hidden="true" className="mx-auto mt-6 h-px w-24 bg-gold/70" />
        </div>

        {offers.length > 0 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {offers.map((offer) => (
              <li key={offer.slug} className="flex">
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 flex flex-col items-center gap-6 text-center lg:mt-16">
            <p className="text-body text-charcoal">There are no offers running right now.</p>
            <BookStayLink source="offers-empty" />
          </div>
        )}
      </section>
    </main>
  )
}
