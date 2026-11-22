import { ResortTile } from "@/components/home/resort-tile"
import { SectionHeading } from "@/components/ui/section-heading"
import type { DestinationsPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Group = DestinationsPage["groups"][number]

/** One /destinations section: centered heading over a 1 → 2 → 3 column grid of resort tiles. */
export function DestinationGroup({ group, className }: { group: Group; className?: string }) {
  const titleId = `${group.id}-title`
  return (
    <section id={group.id} aria-labelledby={titleId} className={cn("container-site scroll-mt-8", className)}>
      <SectionHeading id={titleId} title={group.title} subtitle={group.subtitle} />
      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
        {group.resorts.map((resort) => (
          <li key={resort.slug}>
            <ResortTile resort={resort} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />
          </li>
        ))}
      </ul>
    </section>
  )
}
