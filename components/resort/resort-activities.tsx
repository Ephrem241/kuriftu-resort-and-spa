import Link from "next/link"

import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { ActivityTile } from "@/lib/content/activities"

/** "Activities & Experiences": intro on the left, photo tiles on the right. */
export function ResortActivities({ tiles, resortSlug }: { tiles: ActivityTile[]; resortSlug: string }) {
  if (tiles.length === 0) return null

  return (
    <section aria-labelledby="activities-title" className="mt-16 bg-beige/50 py-6 lg:mt-14">
      <div className="container-site grid gap-8 lg:grid-cols-[minmax(0,15.5rem)_1fr] lg:items-center lg:gap-6">
        <div>
          <span aria-hidden="true" className="block h-px w-10 bg-gold" />
          <h2 id="activities-title" className="mt-5 text-h3 lg:text-[1.875rem]">
            Activities &amp; Experiences
          </h2>
          <p className="mt-3 max-w-60 text-small text-charcoal">
            Make the most of your stay with our exciting activities and experiences.
          </p>
          <ButtonLink
            href={`/experience?resort=${encodeURIComponent(resortSlug)}`}
            variant="primary"
            size="pill"
            shape="pill"
            arrow
            className="mt-6"
          >
            Explore Activities
          </ButtonLink>
        </div>

        {/* Scroll-snap row; four tiles visible on desktop. */}
        <ul
          aria-label="Activities"
          className="-mx-[5.5%] flex snap-x snap-mandatory scroll-px-[5%] lg:scroll-px-0 gap-3 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] lg:mx-0 lg:px-0 lg:pb-0"
        >
          {tiles.map((tile) => (
            <li key={tile.key} className="w-[46%] shrink-0 snap-start md:w-[30%] lg:w-[calc((100%-2.25rem)/4)]">
              <Link
                href={tile.href}
                className="group/tile relative block aspect-[4/3.2] overflow-hidden rounded-lg bg-beige"
              >
                <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/tile:scale-105">
                  <MediaImage image={tile.image} sizes="(min-width: 1025px) 17vw, (min-width: 768px) 30vw, 46vw" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-charcoal/75 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 p-3 text-small font-bold text-ivory lg:text-body">
                  {tile.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
