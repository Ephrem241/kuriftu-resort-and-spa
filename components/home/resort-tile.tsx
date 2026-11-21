import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import type { ResortSummary } from "@/lib/content/types"

/** Destination tile: full-bleed image, forest gradient, name, tagline, action. */
export function ResortTile({ resort }: { resort: ResortSummary }) {
  return (
    <Link
      href={`/resorts/${resort.slug}`}
      className="group/tile relative block aspect-[4/3.6] overflow-hidden rounded-lg bg-beige"
    >
      <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/tile:scale-105">
        <MediaImage
          image={resort.image}
          sizes="(min-width: 1025px) 18vw, (min-width: 768px) 40vw, 72vw"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-forest via-forest/75 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 text-ivory lg:p-5">
        <h3 className="font-heading text-h4 text-ivory">{resort.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-caption">
          <MapPin aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
          {resort.tagline}
        </p>
        <span className="mt-3 inline-flex items-center gap-2 text-caption font-bold">
          Explore Resort
          <ArrowRight
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-3.5 transition-transform duration-hover ease-soft group-hover/tile:translate-x-1"
          />
        </span>
      </div>
    </Link>
  )
}
