"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Square, User } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { RoomSummary } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** Featured room carousel: image left, details right, arrows below. */
export function FeaturedRooms({ rooms }: { rooms: RoomSummary[] }) {
  const [index, setIndex] = useState(0)
  const count = rooms.length
  if (count === 0) return null
  const go = (n: number) => setIndex((n + count) % count)
  const single = count < 2

  const arrowClass =
    "flex size-8 cursor-pointer items-center justify-center rounded-full text-charcoal transition-colors duration-hover hover:text-forest disabled:cursor-default disabled:text-muted/50"

  return (
    <div aria-roledescription="carousel" aria-label="Featured rooms" className="mt-6">
      <div aria-live="polite" className="relative">
        {rooms.map((room, i) => (
          <article
            key={room.slug}
            aria-hidden={i !== index}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn(
              "grid gap-6 transition-opacity duration-fade ease-soft md:grid-cols-[1.55fr_1fr] md:items-center md:gap-8",
              i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
              <MediaImage image={room.image} sizes="(min-width: 1025px) 36vw, (min-width: 768px) 55vw, 90vw" />
            </div>
            <div>
              <h3 className="font-heading text-h4">{room.title}</h3>
              <p className="mt-3 max-w-60 text-small text-charcoal">{room.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-caption text-charcoal">
                {room.maxGuests ? (
                  <li className="flex items-center gap-2">
                    <User aria-hidden="true" strokeWidth={1.5} className="size-4 fill-forest text-forest" />
                    {room.maxGuests} Guests
                  </li>
                ) : null}
                {room.sizeSqm ? (
                  <li className="flex items-center gap-2">
                    <Square aria-hidden="true" strokeWidth={1.5} className="size-3.5 text-forest" />
                    {room.sizeSqm} m²
                  </li>
                ) : null}
              </ul>
              <ButtonLink
                href={`/resorts/${room.resortSlug}/rooms/${room.slug}`}
                tabIndex={i === index ? undefined : -1}
                variant="primary"
                size="pill"
                shape="pill"
                arrow
                className="mt-6"
              >
                View Details<span className="sr-only">: {room.title}</span>
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-1 md:mt-4">
        <button
          type="button"
          aria-label="Previous room"
          disabled={single}
          onClick={() => go(index - 1)}
          className={arrowClass}
        >
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next room"
          disabled={single}
          onClick={() => go(index + 1)}
          className={arrowClass}
        >
          <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
      </div>
    </div>
  )
}
