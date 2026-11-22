import { Play } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { PortableText } from "@/components/ui/portable-text"
import { VideoLightbox } from "@/components/ui/video-lightbox"
import type { ResortPage } from "@/lib/content/types"
import { toEmbedUrl } from "@/lib/video"

/** "About This Resort": intro copy and a photo card that opens the tour video. */
export function ResortAbout({ resort }: { resort: ResortPage }) {
  const embedUrl = toEmbedUrl(resort.heroVideoUrl)

  const media = (
    <div className="relative aspect-[16/8.5] overflow-hidden rounded-xl bg-beige">
      <MediaImage image={resort.aboutImage} sizes="(min-width: 1025px) 50vw, 90vw" />
    </div>
  )

  return (
    <section
      aria-labelledby="about-title"
      className="container-site grid gap-10 pt-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12 lg:pt-4"
    >
      <div>
        <p className="flex items-center gap-3 font-heading text-body text-charcoal lg:text-[1.0625rem]">
          <span aria-hidden="true" className="h-px w-5 bg-gold" />
          About This Resort
        </p>
        {resort.introTitle ? (
          <h2 id="about-title" className="mt-2 max-w-md text-h3 lg:text-[2.125rem] lg:leading-[1.2]">
            {resort.introTitle}
          </h2>
        ) : (
          <h2 id="about-title" className="sr-only">
            About {resort.heading}
          </h2>
        )}
        <PortableText value={resort.intro} className="mt-5 max-w-lg text-small text-charcoal md:text-body" />
        <ButtonLink href="#amenities" variant="primary" size="pill" shape="pill" arrow className="mt-8">
          Explore Our Resort
        </ButtonLink>
      </div>

      {embedUrl ? (
        <VideoLightbox
          embedUrl={embedUrl}
          title={`Resort tour: ${resort.heading}`}
          source="resort-tour"
          trigger={
            <button
              type="button"
              className="group/tour relative block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {media}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-xl bg-linear-to-t from-charcoal/50 via-transparent to-transparent"
              />
              <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/30 ring-1 ring-ivory/70 backdrop-blur-sm transition-transform duration-hover ease-soft group-hover/tour:scale-105">
                <Play aria-hidden="true" strokeWidth={1.5} className="ml-0.5 size-6 fill-ivory text-ivory" />
              </span>
              <span className="absolute bottom-5 left-6 flex items-center gap-3 text-small font-bold text-ivory">
                <span className="flex size-6 items-center justify-center rounded-full bg-ivory">
                  <Play aria-hidden="true" strokeWidth={1.5} className="ml-px size-3 fill-forest text-forest" />
                </span>
                Watch Resort Tour
              </span>
            </button>
          }
        />
      ) : (
        media
      )}
    </section>
  )
}
