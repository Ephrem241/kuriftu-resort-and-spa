import { SectionHeading } from "@/components/ui/section-heading"
import type { HomePage } from "@/lib/content/types"

import { ResortTile } from "./resort-tile"

export function Destinations({ content }: { content: HomePage["destinations"] }) {
  return (
    <section aria-labelledby="destinations-title" className="pt-14 lg:pt-16">
      <SectionHeading
        id="destinations-title"
        title={content.title}
        subtitle={content.subtitle}
        className="container-site"
      />
      {/* Scroll-snap row below 1025px; five columns on desktop. */}
      <div
        role="region"
        aria-label="Destinations"
        tabIndex={0}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[5%] pb-2 [scrollbar-width:none] lg:container-site lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {content.resorts.map((resort) => (
          <div key={resort.slug} className="w-[72%] shrink-0 snap-start md:w-[40%] lg:w-auto">
            <ResortTile resort={resort} />
          </div>
        ))}
      </div>
    </section>
  )
}
