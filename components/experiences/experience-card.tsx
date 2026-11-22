import { Clock, MapPin } from "lucide-react"

import { ContentCard, type CardMeta } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { pathForDocument } from "@/lib/content/routes"
import type { ExperienceSummary } from "@/lib/content/types"

/** One experience in a grid: photo, title, summary, where and how long. */
export function ExperienceCard({ experience }: { experience: ExperienceSummary }) {
  const meta: CardMeta[] = []
  if (experience.resorts.length > 0) {
    meta.push({ icon: MapPin, label: experience.resorts.map((r) => r.heading).join(", ") })
  }
  if (experience.duration) meta.push({ icon: Clock, label: experience.duration })

  return (
    <ContentCard
      className="w-full"
      image={
        <MediaImage image={experience.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />
      }
      title={experience.title}
      subtitle={experience.summary}
      subtitleClassName="line-clamp-3"
      meta={meta}
      href={pathForDocument({ _type: "experience", slug: experience.slug }) ?? "/experience"}
      action="Discover"
    />
  )
}
