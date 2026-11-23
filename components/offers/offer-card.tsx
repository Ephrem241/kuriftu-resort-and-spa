import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { formatOfferDate, offerAction, offerSubtitle, offerWhere } from "@/lib/content/offers"
import { pathForDocument } from "@/lib/content/routes"
import type { OfferSummary } from "@/lib/content/types"

/**
 * Offer card from the offers reference: image with an editor's badge, title,
 * short line, end date and where it applies, then a centred "Book Now".
 * The title links to the offer page; "Book Now" hands off to booking.
 */
export function OfferCard({ offer }: { offer: OfferSummary }) {
  const href = pathForDocument({ _type: "offer", slug: offer.slug }) ?? "/offers"
  const until = formatOfferDate(offer.endDate)
  const subtitle = offerSubtitle(offer.title, offer.shortLine)
  const action = offerAction(offer.resorts)
  const titleId = `offer-${offer.slug}`

  return (
    <article
      aria-labelledby={titleId}
      className="group/card relative flex w-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-lg shadow-charcoal/8"
    >
      <div className="relative aspect-[12/5] overflow-hidden bg-beige">
        <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/card:scale-105">
          <MediaImage image={offer.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 100vw" />
        </div>
        {offer.badge ? (
          <p className="absolute top-4 left-4 rounded-full bg-gold px-4 py-1.5 text-small leading-none font-bold tracking-wide text-charcoal uppercase shadow-sm">
            {offer.badge}
          </p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
        <h3 id={titleId} className="text-h4">
          {/* Stretched over the image and copy; "Book Now" sits above it. */}
          <Link href={href} className="after:absolute after:inset-0 hover:text-charcoal">
            {offer.title}
          </Link>
        </h3>
        {subtitle ? <p className="mt-2 line-clamp-2 text-small text-charcoal">{subtitle}</p> : null}

        <ul className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 text-caption text-charcoal">
          {until ? (
            <li className="flex items-start gap-2">
              <CalendarDays aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0 text-forest" />
              <span className="flex flex-col leading-tight">
                <span>Valid until</span>
                <span>{until}</span>
              </span>
            </li>
          ) : null}
          <li className="flex min-w-0 items-start gap-2">
            <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0 text-forest" />
            <span className="line-clamp-1">{offerWhere(offer.resorts)}</span>
          </li>
        </ul>

        <div className="relative z-10 mt-auto flex justify-center pt-5">
          {action.kind === "book" ? (
            <BookStayLink
              source="offers"
              resort={action.resort?.slug}
              property={action.resort?.bookingProperty}
              label="Book Now"
              className="h-9 px-6"
            />
          ) : (
            <ButtonLink href={href} variant="primary" size="pill" shape="pill" arrow className="h-9 px-6">
              Enquire Now
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  )
}
