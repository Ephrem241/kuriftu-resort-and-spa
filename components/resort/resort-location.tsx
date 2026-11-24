import { ArrowRight, MapPin } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { ResortPage } from "@/lib/content/types"
import { googleMapsUrl, osmEmbedUrl } from "@/lib/maps"
import { cn } from "@/lib/utils"

import { DeferredMap } from "./deferred-map"

/** "Location": directions copy and an embedded map with the resort's pin. */
export function ResortLocation({ resort }: { resort: ResortPage }) {
  if (!resort.geo) return null
  const embed = osmEmbedUrl(resort.geo)
  const mapLink = googleMapsUrl(resort.geo)
  if (!embed || !mapLink) return null

  return (
    <section
      aria-labelledby="location-title"
      className="grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center lg:gap-8"
    >
      <div>
        <span aria-hidden="true" className="block h-px w-10 bg-gold" />
        <h2 id="location-title" className="mt-5 text-h3 lg:text-[1.875rem]">
          Location
        </h2>
        {resort.gettingHere ? (
          <p className="mt-3 max-w-60 text-small text-charcoal">{resort.gettingHere}</p>
        ) : null}
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "pill", shape: "pill" }), "mt-6")}
        >
          View on Map<span className="sr-only"> (opens Google Maps in a new tab)</span>
          <ArrowRight
            aria-hidden="true"
            strokeWidth={1.5}
            className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
          />
        </a>
      </div>

      <div className="relative aspect-[16/10.5] overflow-hidden rounded-xl border border-line bg-beige">
        <DeferredMap src={embed} title={`Map showing ${resort.heading}`} />
        <div className="pointer-events-none absolute top-1/4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-card px-3 py-2 text-caption font-bold text-charcoal shadow-md">
          <MapPin aria-hidden="true" strokeWidth={1.5} className="size-5 fill-error text-card" />
          <span className="max-w-36">{resort.heading}</span>
        </div>
      </div>
    </section>
  )
}
