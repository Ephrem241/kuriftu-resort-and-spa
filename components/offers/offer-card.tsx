import { CalendarDays, MapPin } from "lucide-react"

import { ContentCard } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { formatOfferDate, offerSubtitle } from "@/lib/content/offers"
import { pathForDocument } from "@/lib/content/routes"
import type { OfferSummary } from "@/lib/content/types"

/** Offer card: image, title, short line, end date and where it applies. */
export function OfferCard({ offer }: { offer: OfferSummary }) {
  const until = formatOfferDate(offer.endDate)
  const where = offer.resorts.length > 0 ? offer.resorts.map((r) => r.name).join(", ") : "All resorts"

  return (
    <ContentCard
      image={<MediaImage image={offer.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 100vw" />}
      title={offer.title}
      subtitle={offerSubtitle(offer.title, offer.shortLine) || undefined}
      meta={[
        ...(until ? [{ icon: CalendarDays, label: `Until ${until}` }] : []),
        { icon: MapPin, label: where },
      ]}
      href={pathForDocument({ _type: "offer", slug: offer.slug }) ?? "/offers"}
      action="View offer"
      className="w-full"
    />
  )
}
