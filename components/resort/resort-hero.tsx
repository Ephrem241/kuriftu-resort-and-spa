import Link from "next/link"
import { ChevronRight, Leaf, MapPin } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import type { ResortPage, ResortType } from "@/lib/content/types"

const TYPE_LABELS: Record<ResortType, string> = {
  resortAndSpa: "Resort & Spa",
  adventurePark: "Adventure Park",
  waterPark: "Water Park",
  daySpa: "Day Spa",
}

/** Resort hero: breadcrumb, heading, summary and an info pill over the photo. */
export function ResortHero({ resort }: { resort: ResortPage }) {
  const place = [resort.locationLabel, resort.country].filter(Boolean).join(", ")

  return (
    <section aria-labelledby="resort-title" className="relative isolate flex flex-col overflow-hidden lg:block">
      {/* Image: right ~68% on desktop, full-width block below the copy on smaller screens. */}
      <div className="relative order-2 aspect-4/3 w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[68%]">
        <MediaImage image={resort.heroImage} sizes="(min-width: 1025px) 68vw, 100vw" fetchPriority="high" />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-ivory via-ivory/70 to-transparent lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-ivory/80 to-transparent lg:hidden"
        />
      </div>

      <div className="relative z-10 order-1 container-site pt-32 pb-10 lg:flex lg:min-h-[40rem] lg:flex-col lg:justify-center lg:pt-36 lg:pb-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-small text-charcoal">
            <li className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-gold" />
              <Link href="/destinations" className="hover:text-forest hover:underline">
                Our Resorts
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight strokeWidth={1.5} className="size-3.5" />
            </li>
            <li aria-current="page">{resort.name}</li>
          </ol>
        </nav>

        <h1 id="resort-title" className="mt-4 max-w-xl text-[2.5rem] leading-[1.1] md:text-h1 lg:text-[3.25rem]">
          {resort.heading}
        </h1>
        {resort.summary ? (
          <p className="mt-5 max-w-sm text-body text-charcoal lg:text-[1.0625rem]">{resort.summary}</p>
        ) : null}

        <ul className="mt-8 inline-flex flex-wrap items-center gap-x-5 gap-y-2 self-start rounded-full bg-ivory/85 px-6 py-4 text-caption text-charcoal shadow-sm backdrop-blur-sm">
          {place ? (
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" strokeWidth={1.5} className="size-5 text-forest" />
              {place}
            </li>
          ) : null}
          <li className="flex items-center gap-2 border-line md:border-l md:pl-5">
            <Leaf aria-hidden="true" strokeWidth={1.5} className="size-5 text-forest" />
            {TYPE_LABELS[resort.type]}
          </li>
        </ul>
      </div>
    </section>
  )
}
