"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Testimonial } from "@/lib/content/types"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Guest quote carousel on the forest band. Manual controls only. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const count = items.length
  if (count === 0) return null
  const item = items[index]
  const go = (n: number) => setIndex((n + count) % count)

  const arrowClass =
    "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors duration-hover hover:bg-ivory hover:text-forest disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ivory"

  return (
    <div aria-roledescription="carousel" aria-label="Guest reviews" className="mt-8">
      <div className="flex items-center gap-4 md:gap-8">
        <button
          type="button"
          aria-label="Previous review"
          disabled={count < 2}
          onClick={() => go(index - 1)}
          className={arrowClass}
        >
          <ChevronLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>

        <figure aria-live="polite" className="flex-1 text-center">
          <blockquote className="mx-auto max-w-md text-small font-bold text-ivory md:text-body">
            <p>“{item.quote}”</p>
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-center gap-3 text-left">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border border-gold bg-ivory text-caption font-bold text-forest"
            >
              {initials(item.name)}
            </span>
            <span>
              <span className="block text-small font-bold text-ivory">{item.name}</span>
              <span className="block text-caption text-ivory/80">{item.location}</span>
            </span>
          </figcaption>
        </figure>

        <button
          type="button"
          aria-label="Next review"
          disabled={count < 2}
          onClick={() => go(index + 1)}
          className={arrowClass}
        >
          <ChevronRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
      </div>

      {count > 1 ? (
        <div className="mt-4 flex justify-end gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Review ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className="flex size-6 cursor-pointer items-center justify-center"
            >
              <span
                className={cn(
                  "block h-0.5 rounded-full transition-all duration-hover",
                  i === index ? "w-4 bg-ivory" : "w-2 bg-ivory/40"
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
