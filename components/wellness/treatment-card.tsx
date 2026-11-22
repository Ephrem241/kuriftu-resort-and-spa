import { Clock, MapPin, Tag } from "lucide-react"

import { ContentCard, type CardMeta } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import type { TreatmentSummary } from "@/lib/content/types"
import { formatTreatmentPrice, treatmentRequestHref } from "@/lib/content/wellness"

/** One spa treatment in a grid: photo, title, excerpt, where, how long, and any editor price. */
export function TreatmentCard({ treatment }: { treatment: TreatmentSummary }) {
  const meta: CardMeta[] = []
  if (treatment.resorts.length > 0) {
    meta.push({ icon: MapPin, label: treatment.resorts.map((r) => r.heading).join(", ") })
  }
  if (treatment.duration) meta.push({ icon: Clock, label: treatment.duration })
  const price = formatTreatmentPrice(treatment.price)
  if (price) meta.push({ icon: Tag, label: price })

  return (
    <ContentCard
      className="w-full"
      image={
        <MediaImage image={treatment.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />
      }
      title={treatment.title}
      subtitle={treatment.excerpt || undefined}
      subtitleClassName="line-clamp-3"
      meta={meta}
      href={treatmentRequestHref(treatment.slug)}
      action="Request Booking"
    />
  )
}
