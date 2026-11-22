"use client"

import { useState } from "react"
import { Play } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import { VideoLightbox } from "@/components/ui/video-lightbox"
import type { ContentImage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type RoomGalleryProps = {
  title: string
  images: ContentImage[]
  /** Already-validated embed URL from toEmbedUrl(), or null. */
  embedUrl: string | null
}

/** Large room photo (with tour video when set) and a thumbnail strip that selects it. */
export function RoomGallery({ title, images, embedUrl }: RoomGalleryProps) {
  const [selected, setSelected] = useState(0)
  const image = images[selected] ?? images[0]

  const main = (
    <div className="relative aspect-[16/8.6] overflow-hidden rounded-xl bg-beige">
      <div key={selected} className="absolute inset-0 motion-safe:animate-fade-in">
        <MediaImage image={image} sizes="(min-width: 1025px) 52vw, 90vw" />
      </div>
    </div>
  )

  return (
    <div>
      {embedUrl ? (
        <VideoLightbox
          embedUrl={embedUrl}
          title={`Room tour: ${title}`}
          source="room-tour"
          trigger={
            <button
              type="button"
              aria-label={`Play room tour: ${title}`}
              className="group/tour relative block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {main}
              <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/30 ring-1 ring-ivory/70 backdrop-blur-sm transition-transform duration-hover ease-soft group-hover/tour:scale-105">
                <Play aria-hidden="true" strokeWidth={1.5} className="ml-0.5 size-6 fill-ivory text-ivory" />
              </span>
            </button>
          }
        />
      ) : (
        main
      )}

      {images.length > 1 ? (
        <ul
          aria-label="Room photos"
          className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {images.map((thumb, i) => (
            <li key={`${thumb.src ?? "placeholder"}-${i}`} className="w-[calc((100%-2.25rem)/4)] min-w-20 shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={i === selected}
                aria-label={`Show photo ${i + 1} of ${images.length}${thumb.alt ? `: ${thumb.alt}` : ""}`}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative block aspect-[16/10.5] w-full cursor-pointer overflow-hidden rounded-md bg-beige ring-offset-2 ring-offset-ivory transition-shadow duration-hover ease-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  i === selected ? "ring-2 ring-gold" : "hover:ring-1 hover:ring-gold/60"
                )}
              >
                <MediaImage image={{ ...thumb, alt: "" }} sizes="(min-width: 1025px) 12vw, 22vw" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
