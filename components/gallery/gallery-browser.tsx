"use client"

import { useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ImageLightbox } from "@/components/ui/image-lightbox"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { filterPhotos, galleryQuery, parseGalleryResort } from "@/lib/content/gallery"
import type { GalleryPhoto, GalleryResort } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type BrowserProps = {
  id: string
  resorts: GalleryResort[]
  photos: GalleryPhoto[]
}

/**
 * Resort filter, photo grid and lightbox, driven by `?resort=`. Render inside
 * <Suspense> with `GalleryBrowserFallback`, so the static HTML lists every photo.
 */
export function GalleryBrowser(props: BrowserProps) {
  const searchParams = useSearchParams()
  const resort = parseGalleryResort(
    searchParams,
    props.resorts.map((r) => r.slug)
  )

  // The native History API keeps the static page (no server round trip) and
  // Next syncs useSearchParams with it.
  const onChange = (next: string | null) =>
    window.history.replaceState(null, "", `${window.location.pathname}${galleryQuery(next)}${window.location.hash}`)

  return <GalleryView {...props} resort={resort} onChange={onChange} />
}

/** Unfiltered view for the prerendered HTML, before the URL is read. */
export function GalleryBrowserFallback(props: BrowserProps) {
  return <GalleryView {...props} resort={null} onChange={() => {}} />
}

type ViewProps = BrowserProps & { resort: string | null; onChange: (resort: string | null) => void }

function GalleryView({ id, resorts, photos, resort, onChange }: ViewProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const tiles = useRef<(HTMLButtonElement | null)[]>([])
  const shown = filterPhotos(photos, resort)
  const heading = resorts.find((r) => r.slug === resort)?.heading
  const chips = [{ slug: null, label: "All" }, ...resorts.map((r) => ({ slug: r.slug, label: r.name }))]

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
      <SectionHeading
        id={`${id}-title`}
        align="start"
        title={heading ?? "All Photos"}
        subtitle="Moments from across our destinations"
      />

      <ul aria-label="Filter photos by destination" className="mt-6 flex flex-wrap gap-2 lg:mt-8">
        {chips.map((chip) => {
          const active = resort === chip.slug
          return (
            <li key={chip.slug ?? "all"}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange(chip.slug)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border border-line bg-beige px-5 text-small text-charcoal transition-colors duration-hover ease-soft hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  active && "border-forest bg-forest text-ivory hover:text-ivory"
                )}
              >
                {chip.label}
              </button>
            </li>
          )
        })}
      </ul>

      <div aria-live="polite" className="mt-8 lg:mt-10">
        <p className="sr-only">
          {shown.length} {shown.length === 1 ? "photo" : "photos"} shown
        </p>
        {shown.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {shown.map((photo, i) => (
              <li key={`${photo.resortSlug}-${photo.image.src ?? "placeholder"}-${i}`}>
                <button
                  ref={(el) => {
                    tiles.current[i] = el
                  }}
                  type="button"
                  aria-label={`Open photo ${i + 1} of ${shown.length}${photo.image.alt ? `: ${photo.image.alt}` : ""}`}
                  onClick={() => {
                    setIndex(i)
                    setOpen(true)
                  }}
                  className="group/tile relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl bg-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/tile:scale-105">
                    <MediaImage
                      image={{ ...photo.image, alt: "" }}
                      sizes="(min-width: 1440px) 22vw, (min-width: 1025px) 30vw, 45vw"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-body text-charcoal">No photos yet.</p>
        )}
      </div>

      <ImageLightbox
        images={shown.map((p) => p.image)}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
        returnFocus={(i) => tiles.current[i] ?? null}
        label={resort ? undefined : (i) => shown[i]?.resortName ?? ""}
      />
    </section>
  )
}
