"use client"

import { useId, type KeyboardEvent } from "react"
import { Modal } from "@/components/ui/modal"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import { stepIndex } from "@/lib/content/gallery"
import type { ContentImage } from "@/lib/content/types"

type ImageLightboxProps = {
  images: ContentImage[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Photo shown. Kept after close, so focus returns to its tile. */
  index: number
  onIndexChange: (index: number) => void
  /** Element that gets focus back on close (the tile of the photo last shown). */
  returnFocus: (index: number) => HTMLElement | null
  /** Optional line under the caption, e.g. the resort name. */
  label?: (index: number) => string
}

const navButton =
  "flex size-11 cursor-pointer items-center justify-center rounded-full bg-ivory/15 text-ivory ring-1 ring-ivory/50 backdrop-blur-sm transition-colors duration-hover ease-soft hover:bg-ivory hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"

/** Full-size photos in an accessible modal: prev/next buttons, arrow keys, Esc, focus returned on close. */
export function ImageLightbox({ images, open, onOpenChange, index, onIndexChange, returnFocus, label }: ImageLightboxProps) {
  const count = images.length
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0))
  const image = images[current]

  const titleId = useId()
  const step = (by: 1 | -1) => onIndexChange(stepIndex(current, by, count))

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (count < 2) return
    if (e.key === "ArrowRight") {
      e.preventDefault()
      step(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <Modal
      open={open && count > 0}
      onOpenChange={onOpenChange}
      labelledBy={titleId}
      finalFocus={() => returnFocus(current)}
      onKeyDown={onKeyDown}
      backdropClassName="fixed inset-0 z-50 bg-charcoal/90 transition-opacity duration-fade data-ending-style:opacity-0 data-starting-style:opacity-0"
      popupClassName="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-4 py-16 transition-opacity duration-fade outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 md:px-20"
    >
      <h2 id={titleId} className="sr-only">
        Photo {current + 1} of {count}
      </h2>

      {image ? (
        <figure className="flex size-full max-w-[1200px] flex-col items-center gap-3">
          <div className="relative w-full flex-1">
            <MediaImage
              key={current}
              image={{ ...image, objectPosition: undefined }}
              sizes="90vw"
              className="object-contain motion-safe:animate-fade-in"
            />
          </div>
          <figcaption className="text-center text-small text-ivory">
            <span className="block">{image.alt}</span>
            <span className="mt-1 block text-caption text-ivory/80">
              {label ? `${label(current)} · ` : ""}
              {current + 1} / {count}
            </span>
          </figcaption>
        </figure>
      ) : null}

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => step(-1)}
            className={`${navButton} absolute top-1/2 left-2 -translate-y-1/2 md:left-6`}
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.5} className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => step(1)}
            className={`${navButton} absolute top-1/2 right-2 -translate-y-1/2 md:right-6`}
          >
            <ChevronRight aria-hidden="true" strokeWidth={1.5} className="size-6" />
          </button>
        </>
      ) : null}

      <button
        type="button"
        aria-label="Close photo"
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full text-ivory hover:text-gold focus-visible:outline-2 focus-visible:outline-gold md:top-6 md:right-6"
      >
        <X aria-hidden="true" strokeWidth={1.5} className="size-6" />
      </button>
    </Modal>
  )
}
