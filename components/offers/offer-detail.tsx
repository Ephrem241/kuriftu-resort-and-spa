import Link from "next/link"
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { ContactActions } from "@/components/site/contact-actions"
import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { PortableText } from "@/components/ui/portable-text"
import { formatOfferDate, offerAction, offerSubtitle } from "@/lib/content/offers"
import type { OfferPage, PropertyContact } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type OfferDetailProps = {
  offer: OfferPage
  /** Site reservations, for offers no listed resort can book. */
  reservations: PropertyContact
}

/** One offer: copy, dates, where it applies, how to book, and its terms. */
export function OfferDetail({ offer, reservations }: OfferDetailProps) {
  const subtitle = offerSubtitle(offer.title, offer.shortLine)
  const start = formatOfferDate(offer.startDate)
  const end = formatOfferDate(offer.endDate)
  const where = offer.resorts.length > 0 ? offer.resorts.map((r) => r.heading).join(", ") : "All Resorts"
  const action = offerAction(offer.resorts)

  return (
    <article aria-labelledby="offer-title" className="container-site pt-32 pb-16 lg:pt-36 lg:pb-24">
      <Link
        href="/offers"
        className={cn(
          buttonVariants({ variant: "secondary", shape: "pill" }),
          "group/back h-9 gap-2 border-forest/60 bg-ivory/70 px-5 font-bold"
        )}
      >
        <ArrowLeft
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-4 transition-transform duration-hover ease-soft group-hover/back:-translate-x-1"
        />
        All Offers
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <div className="relative order-first aspect-4/3 overflow-hidden rounded-xl bg-beige lg:sticky lg:top-28 lg:order-last">
          <MediaImage image={offer.image} sizes="(min-width: 1025px) 50vw, 100vw" priority />
        </div>

        <div>
          <p className="eyebrow text-forest">Special Offer</p>
          <h1 id="offer-title" className="mt-3 text-[2.5rem] leading-[1.1] md:text-h1">
            {offer.title}
          </h1>
          {subtitle ? <p className="mt-4 text-body text-charcoal lg:text-[1.0625rem]">{subtitle}</p> : null}

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {start && end ? (
              <li className="flex items-center gap-2 text-small text-charcoal">
                <CalendarDays aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                <span>
                  <span className="sr-only">Valid </span>
                  {start} – {end}
                </span>
              </li>
            ) : null}
            <li className="flex items-center gap-2 text-small text-charcoal">
              <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
              {where}
            </li>
          </ul>

          {offer.promoCode ? (
            <p className="mt-6 inline-flex items-center gap-3 rounded-md border border-line bg-beige px-4 py-2">
              <span className="eyebrow text-charcoal">Promo code</span>
              <span className="font-bold tracking-wider text-forest">{offer.promoCode}</span>
            </p>
          ) : null}

          {offer.description.length > 0 ? (
            <PortableText value={offer.description} headingLevel={2} className="mt-8 text-body text-charcoal" />
          ) : null}

          <aside aria-labelledby="offer-book-title" className="mt-10 rounded-xl bg-forest p-8 lg:p-10">
            <h2 id="offer-book-title" className="text-h4 text-ivory lg:text-[1.75rem]">
              {action.kind === "book" ? "Book Your Stay" : "Contact Us to Book"}
            </h2>
            <p className="mt-3 max-w-md text-small text-ivory">
              Final rates and availability are confirmed in booking.
            </p>
            {action.kind === "book" ? (
              <BookStayLink
                source="offer"
                resort={action.resort?.slug}
                propertyId={action.resort?.bookingPropertyId}
                variant="accent"
                className="mt-6 text-charcoal hover:text-ivory"
              />
            ) : (
              <ContactActions
                phone={action.resort?.phone ?? reservations.phone}
                email={action.resort?.email ?? reservations.email}
                source="offer"
                className="mt-6"
              />
            )}
          </aside>
        </div>
      </div>

      {offer.terms.length > 0 ? (
        <section aria-labelledby="offer-terms-title" className="mt-16 max-w-3xl border-t border-line pt-10">
          <h2 id="offer-terms-title" className="text-h4">
            Terms &amp; Conditions
          </h2>
          <PortableText value={offer.terms} className="mt-4 text-small text-charcoal" />
        </section>
      ) : null}
    </article>
  )
}
