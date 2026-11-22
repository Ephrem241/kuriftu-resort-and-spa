import { ContentIcon } from "@/components/ui/content-icon"
import { SectionHeading } from "@/components/ui/section-heading"
import type { Amenity } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** Desktop column count; dividers restart on each new desktop row. */
const COLUMNS = {
  7: "lg:grid-cols-7 lg:[&>li:nth-child(7n+1)]:border-l-0",
  8: "lg:grid-cols-8 lg:[&>li:nth-child(8n+1)]:border-l-0",
} as const

type AmenityGridProps = {
  id: string
  title: string
  subtitle: string
  amenities: Amenity[]
  columns: keyof typeof COLUMNS
  className?: string
}

/** Centred heading and icon circles with labels, as stored in Sanity. */
export function AmenityGrid({ id, title, subtitle, amenities, columns, className }: AmenityGridProps) {
  if (amenities.length === 0) return null

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("container-site scroll-mt-8", className)}>
      <SectionHeading id={`${id}-title`} title={title} subtitle={subtitle} />
      <ul className={cn("mt-8 grid grid-cols-2 gap-y-8 md:grid-cols-4", COLUMNS[columns])}>
        {amenities.map((a) => (
          <li
            key={a.key}
            className="flex flex-col items-center gap-3 px-3 text-center lg:border-l lg:border-line lg:first:border-l-0"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-beige">
              <ContentIcon name={a.icon ?? "leaf"} strokeWidth={1.5} className="size-6 text-forest" />
            </span>
            <span className="max-w-36 text-small text-charcoal">{a.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
