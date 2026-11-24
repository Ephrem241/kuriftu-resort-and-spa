import { Fragment } from "react"
import { Play } from "lucide-react"

import { ButtonLink, buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { VideoLightbox } from "@/components/ui/video-lightbox"
import type { HeroSlide } from "@/lib/content/types"
import { cn } from "@/lib/utils"

import { HeroSlides } from "./hero-slides"

type HeroCarouselProps = {
  slides: HeroSlide[]
  /** Validated YouTube/Vimeo embed URL for "Our Story", or null. */
  storyEmbedUrl: string | null
}

/**
 * Home hero: cross-fading slides, manual controls only (no autoplay).
 * Server-rendered; `HeroSlides` (client) only switches between the pieces.
 */
export function HeroCarousel({ slides, storyEmbedUrl }: HeroCarouselProps) {
  const storyClass = cn(
    buttonVariants({ variant: "outline", size: "pill", shape: "pill" }),
    "gap-3 bg-ivory/40 pr-2 hover:bg-forest"
  )

  const images = slides.map((s, i) => (
    <MediaImage
      key={i}
      image={s.image}
      sizes="(min-width: 1025px) 68vw, 100vw"
      fetchPriority={i === 0 ? "high" : undefined}
    />
  ))

  const copies = slides.map((s, i) => (
    <Fragment key={i}>
      <p className="eyebrow text-forest">{s.eyebrow}</p>
      <h1 className="mt-3 text-[2.5rem] leading-[1.1] md:text-h1 lg:text-[3.5rem]">{s.title}</h1>
      <p className="mt-5 max-w-md text-body text-charcoal lg:text-[1.0625rem]">{s.text}</p>
    </Fragment>
  ))

  const actions = (
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
              <span className="flex size-7 items-center justify-center rounded-full bg-forest text-ivory">
                <Play aria-hidden="true" strokeWidth={1.5} className="size-3! fill-current" />
              </span>
            </button>
          }
        />
      ) : (
        <ButtonLink href="/about" variant="outline" size="pill" shape="pill" className="bg-ivory/40">
          Our Story
        </ButtonLink>
      )}
    </div>
  )

  return (
    <HeroSlides images={images} copies={copies} actions={actions}>
      {/* Soft wave at the bottom edge (shape only, not brand artwork). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-10 h-10 w-full fill-ivory lg:h-20"
      >
        <path d="M0 80V48c160-30 320-42 520-28 220 16 380 52 600 44 140-5 240-26 320-44v60z" />
      </svg>
    </HeroSlides>
  )
}
