"use client"

import { useState, type ReactNode } from "react"
import { ArrowRight, ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"

import { HeroVideo } from "./hero-video"

type HeroSlidesProps = {
  /** Server-rendered image per slide. */
  images: ReactNode[]
  /** Server-rendered eyebrow, heading and text per slide. */
  copies: ReactNode[]
  /** Server-rendered call-to-action row (shared by all slides). */
  actions: ReactNode
  /** Optional muted background loop shown over the first slide's image. */
  videoSrc?: string
  /** Server-rendered decoration after the copy (the wave). */
  children?: ReactNode
}

/**
 * The home hero's only client logic: which slide shows, the prev/next and dot
 * controls, and when slides 2+ mount. All markup arrives from the server.
 */
export function HeroSlides({ images, copies, actions, videoSrc, children }: HeroSlidesProps) {
  const [index, setIndex] = useState(0)
  // Hidden slides sit inside the viewport, so `loading="lazy"` can't hold them
  // back: mount them once the guest reaches for the carousel instead.
  const [armed, setArmed] = useState(false)
  const arm = () => setArmed(true)
  const count = images.length
  const go = (next: number) => setIndex((next + count) % count)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Welcome to Kuriftu"
      className="relative isolate flex flex-col overflow-hidden lg:block"
      onPointerEnter={armed ? undefined : arm}
      onTouchStart={armed ? undefined : arm}
      onFocus={armed ? undefined : arm}
    >
      {/* Image layer: right ~68% on desktop, full-width block below copy on smaller screens. */}
      <div className="relative order-2 aspect-4/3 w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[68%]">
        {images.map((image, i) =>
          i === 0 || armed || i === index ? (
            <div
              key={i}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-fade ease-soft",
                i === index ? "opacity-100" : "opacity-0"
              )}
            >
              {image}
            </div>
          ) : null
        )}
        {videoSrc ? <HeroVideo src={videoSrc} active={index === 0} /> : null}
        {/* Soft ivory fade so copy sits on ivory (desktop). */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-ivory via-ivory/70 to-transparent lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-ivory/80 to-transparent lg:hidden"
        />
      </div>

      <div className="relative z-10 order-1 container-site pt-32 pb-10 lg:flex lg:min-h-[44rem] lg:flex-col lg:justify-center lg:pt-36 lg:pb-40">
        <div aria-live="polite" className="max-w-xl">
          {copies[index]}
        </div>

        {actions}

        {count > 1 ? (
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-charcoal hover:text-forest"
            >
              <ChevronLeft aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </button>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className="flex size-6 cursor-pointer items-center justify-center"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-hover",
                    i === index ? "size-2 bg-forest" : "size-1.5 bg-muted/60"
                  )}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="flex size-7 cursor-pointer items-center justify-center rounded-full text-charcoal hover:text-forest"
            >
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {children}
    </section>
  )
}
