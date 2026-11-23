import Link from "next/link"
import { ArrowRight, CircleCheck, LayoutGrid, MapPin, Users } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { formatCapacity, venuesHref } from "@/lib/content/events"
import type { EventsPage } from "@/lib/content/types"

/** "Our Venues": copy and a checklist at left, the featured venue large at right with its facts. */
export function VenuesFeature({ id, content }: { id: string; content: EventsPage["venues"] }) {
  const featured = content.featured
  const capacity = featured ? formatCapacity(featured.capacity) : null

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="container-site grid scroll-mt-8 items-center gap-8 py-12 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] lg:gap-12 lg:py-16"
    >
      <div>
        <SectionHeading id={`${id}-title`} align="start" title={content.title} className="lg:max-w-sm" />
        {content.subtitle ? <p className="mt-2 text-body text-charcoal">{content.subtitle}</p> : null}
        {content.text ? <p className="mt-4 max-w-md text-small text-charcoal">{content.text}</p> : null}
        {content.highlights.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-2.5">
            {content.highlights.map((v) => (
              <li key={v.id} className="flex items-center gap-3 text-small text-charcoal">
                <CircleCheck aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0 fill-forest text-ivory" />
                {v.name}
              </li>
            ))}
          </ul>
        ) : null}
        <ButtonLink href={venuesHref()} variant="primary" size="pill" shape="pill" arrow className="mt-7">
          View All Venues
        </ButtonLink>
      </div>

      {featured ? (
        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-md lg:aspect-[16/9.5]">
            <MediaImage image={featured.image} sizes="(min-width: 1025px) 58vw, 90vw" className="animate-image-reveal" />
          </div>
          <div className="relative -mt-12 mx-4 rounded-xl bg-white p-6 shadow-xl shadow-charcoal/15 md:mx-auto md:max-w-sm lg:absolute lg:top-1/2 lg:right-4 lg:mx-0 lg:mt-0 lg:w-64 lg:-translate-y-1/2">
            <h3 className="text-h4">{featured.name}</h3>
            <ul className="mt-4 flex flex-col gap-2.5 border-b border-line pb-4">
              {capacity ? (
                <li className="flex items-center gap-3 text-small text-charcoal">
                  <Users aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                  {capacity}
                </li>
              ) : null}
              {featured.setups.length > 0 ? (
                <li className="flex items-center gap-3 text-small text-charcoal">
                  <LayoutGrid aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                  {featured.setups.join(", ")}
                </li>
              ) : null}
              <li className="flex items-center gap-3 text-small text-charcoal">
                <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                {featured.resort.heading}
              </li>
            </ul>
            <Link
              href={venuesHref(featured.resort.slug)}
              className="group/action mt-4 inline-flex items-center gap-2 text-small font-bold text-forest hover:text-charcoal"
            >
              Explore Venue
              <span className="sr-only">: {featured.name}</span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-4 transition-transform duration-hover ease-soft group-hover/action:translate-x-1"
              />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
