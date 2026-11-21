"use client"

import { useState } from "react"
import { ArrowRight, ChevronLeft, Play } from "lucide-react"

import { ButtonLink, buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { VideoLightbox } from "@/components/ui/video-lightbox"
import type { HeroSlide } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type HeroCarouselProps = {
  slides: HeroSlide[]
  /** Validated YouTube/Vimeo embed URL for "Our Story", or null. */
  storyEmbedUrl: string | null
}

/** Home hero: cross-fading slides, manual controls only (no autoplay). */
export function HeroCarousel({ slides, storyEmbedUrl }: HeroCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length
  const slide = slides[index]
  const go = (next: number) => setIndex((next + count) % count)

  const storyClass = cn(
    buttonVariants({ variant: "outline", size: "pill", shape: "pill" }),
    "gap-3 bg-ivory/40 pr-2 hover:bg-forest"
  )
  const playDot = (
    <span className="flex size-7 items-center justify-center rounded-full bg-forest text-ivory">
      <Play aria-hidden="true" strokeWidth={1.5} className="size-3! fill-current" />
    </span>
  )

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Welcome to Kuriftu"
      className="relative isolate flex flex-col overflow-hidden lg:block"
    >
      {/* Image layer: right ~68% on desktop, full-width block below copy on smaller screens. */}
      <div className="relative order-2 aspect-4/3 w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[68%]">
        {slides.map((s, i) => (
          <div
            key={i}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-fade ease-soft",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <MediaImage
              image={s.image}
              sizes="(min-width: 1025px) 68vw, 100vw"
              priority={i === 0}
            />
          </div>
        ))}
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
          <p className="eyebrow text-gold">{slide.eyebrow}</p>
          <h1 className="mt-3 text-[2.5rem] leading-[1.1] md:text-h1 lg:text-[3.5rem]">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-md text-body text-charcoal lg:text-[1.0625rem]">
            {slide.text}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href="/destinations" variant="primary" size="pill" shape="pill" arrow>
            Explore Destinations
          </ButtonLink>
          {storyEmbedUrl ? (
            <VideoLightbox
              embedUrl={storyEmbedUrl}
              title="Our Story: Kuriftu Resorts & Spa"
              source="home-hero"
              trigger={
                <button type="button" className={storyClass}>
                  Our Story
                  {playDot}
                </button>
              }
            />
          ) : (
            <ButtonLink href="/about" variant="outline" size="pill" shape="pill" className="bg-ivory/40">
              Our Story
            </ButtonLink>
          )}
        </div>

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
            {slides.map((_, i) => (
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

      {/* Soft wave at the bottom edge (shape only, not brand artwork). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-10 h-10 w-full fill-ivory lg:h-20"
      >
        <path d="M0 80V48c160-30 320-42 520-28 220 16 380 52 600 44 140-5 240-26 320-44v60z" />
      </svg>
    </section>
  )
}
