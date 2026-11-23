import Link from "next/link"

import { ContentIcon } from "@/components/ui/content-icon"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { eventEnquiryHref } from "@/lib/content/events"
import type { EventsPage } from "@/lib/content/types"

/** "Event Types": photo tiles, each opening the enquiry form with that type selected. */
export function EventTypes({ id, content }: { id: string; content: EventsPage["eventTypes"] }) {
  if (content.tiles.length === 0) return null
  return (
    <section aria-labelledby={`${id}-title`} className="container-site py-12 lg:py-14">
      <SectionHeading id={`${id}-title`} title={content.title} subtitle={content.subtitle || undefined} />
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:mt-10 lg:grid-cols-5">
        {content.tiles.map((tile) => (
          <li key={tile.key} className="animate-slide-up">
            <Link
              href={eventEnquiryHref({ type: tile.eventType })}
              scroll={false}
              className="group/tile relative block aspect-[4/3] overflow-hidden rounded-lg shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/tile:scale-105">
                <MediaImage
                  image={tile.image}
                  sizes="(min-width: 1025px) 18vw, (min-width: 768px) 30vw, 45vw"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-charcoal/85 via-charcoal/40 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-2 pb-3 text-center lg:pb-4">
                {tile.icon ? (
                  <span className="flex size-10 items-center justify-center rounded-full border border-ivory/80 bg-charcoal/20 backdrop-blur-sm">
                    <ContentIcon name={tile.icon} strokeWidth={1.5} className="size-5 text-ivory" />
                  </span>
                ) : null}
                <span className="text-small font-bold text-ivory">{tile.title}</span>
                <span className="sr-only">: enquire</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
