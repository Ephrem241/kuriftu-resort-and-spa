import { getOffers } from "@/lib/content"
import { offerSubtitle, pickPopupOffer } from "@/lib/content/offers"
import { pathForDocument } from "@/lib/content/routes"
import { analyticsEnabled } from "@/lib/analytics/posthog"

import { OfferPopupCard } from "./offer-popup-card"

/** Site-wide popup for the live "Show as popup" offer ending soonest. */
export async function OfferPopup() {
  const offer = pickPopupOffer(await getOffers())
  if (!offer) return null

  return (
    <OfferPopupCard
      consentRequired={analyticsEnabled()}
      offer={{
        slug: offer.slug,
        title: offer.title,
        subtitle: offerSubtitle(offer.title, offer.shortLine),
        href: pathForDocument({ _type: "offer", slug: offer.slug }) ?? "/offers",
        image: offer.image,
        endDate: offer.endDate,
      }}
    />
  )
}
