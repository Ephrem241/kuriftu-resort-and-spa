"use client"

import { useState, type ReactNode } from "react"
import { BedDouble, Flower2, Tag, UsersRound, UtensilsCrossed, type LucideIcon } from "lucide-react"

import { OFFER_CATEGORIES, filterByCategory } from "@/lib/content/offers"
import type { OfferCategory } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const ICONS: Record<OfferCategory, LucideIcon> = {
  deals: Tag,
  stay: BedDouble,
  wellness: Flower2,
  dining: UtensilsCrossed,
  family: UsersRound,
}

export type BrowsableOffer = { slug: string; category: OfferCategory; card: ReactNode }

type OffersBrowserProps = {
  offers: BrowsableOffer[]
  /** Section heading, rendered between the strip and the grid. */
  heading: ReactNode
  /** Shown when there are no live offers at all. */
  empty: ReactNode
  /** Anchor for the hero's "Explore Offers". */
  id: string
}

/**
 * Category strip and offer grid. A tile filters the grid; pressing it again
 * shows every offer. Without JavaScript all offers show.
 */
export function OffersBrowser({ offers, heading, empty, id }: OffersBrowserProps) {
  const [category, setCategory] = useState<OfferCategory | null>(null)
  const shown = filterByCategory(offers, category)
  const label = OFFER_CATEGORIES.find((c) => c.value === category)?.label

  return (
    <>
      <div className="relative z-20 container-site lg:-mt-16">
        <h2 className="sr-only">Filter offers</h2>
        <ul className="-mx-[5.5%] flex snap-x snap-mandatory scroll-px-[5%] gap-2 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-0 md:overflow-visible md:rounded-xl md:bg-beige md:px-4 md:py-3 md:pb-3 md:shadow-sm">
          {OFFER_CATEGORIES.map(({ value, label }, i) => {
            const Icon = ICONS[value]
            const active = category === value
            return (
              <li
                key={value}
                className={cn(
                  "shrink-0 snap-start md:relative",
                  i > 0 && "md:before:absolute md:before:inset-y-3 md:before:left-0 md:before:w-px md:before:bg-line"
                )}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(active ? null : value)}
                  className={cn(
                    "flex min-h-11 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-beige px-3 py-4 text-small text-charcoal transition-colors duration-hover ease-soft hover:text-forest md:w-full md:bg-transparent",
                    active && "bg-forest text-ivory hover:text-ivory md:bg-forest"
                  )}
                >
                  <Icon aria-hidden="true" strokeWidth={1.5} className={cn("size-7", active ? "text-ivory" : "text-forest")} />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        {heading}

        <div aria-live="polite" className="mt-8 lg:mt-10">
          {offers.length === 0 ? (
            empty
          ) : shown.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((offer) => (
                <li key={offer.slug} className="flex animate-slide-up">
                  {offer.card}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-body text-charcoal">No {label} running right now.</p>
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="cursor-pointer text-small font-bold text-forest underline-offset-4 hover:underline"
              >
                Show all offers
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
