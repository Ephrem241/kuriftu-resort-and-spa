import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { VenuesBrowser, VenuesBrowserFallback } from "@/components/events/venues-browser"
import { buttonVariants } from "@/components/ui/button"
import { getSiteSettings, getVenuesPage } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

const GRID_ID = "venue-list"

function fallbackDescription(brandName: string) {
  return `Halls, lakeside lawns and open-air spaces for weddings, meetings and celebrations at ${brandName}.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getVenuesPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/event/venues",
    siteName: settings.brandName,
    image: page.seo.image ?? page.image ?? page.venues[0]?.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Every event venue, filterable by destination (`?resort=`). */
export default async function VenuesPage() {
  const settings = await getSiteSettings()
  const page = await getVenuesPage(fallbackDescription(settings.brandName))
  const browser = { venues: page.venues, id: GRID_ID }

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <header className="container-site animate-fade-in pt-32 pb-8 lg:pt-36 lg:pb-10">
        <Link
          href="/event"
          className={cn(
            buttonVariants({ variant: "secondary", shape: "pill" }),
            "group/back h-9 gap-2 border-forest/60 bg-ivory/70 px-5 font-bold"
          )}
        >
          <ArrowLeft
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-4 transition-transform duration-hover ease-soft group-hover/back:-translate-x-1"
          />
          Celebrations &amp; Events
        </Link>
        <p className="eyebrow mt-8 flex items-center gap-3 text-forest">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {page.eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl">{page.title}</h1>
        {page.intro ? <p className="mt-4 max-w-xl text-body text-charcoal">{page.intro}</p> : null}
      </header>

      {/* The URL filter is read in the browser; the static HTML lists every venue. */}
      <Suspense fallback={<VenuesBrowserFallback {...browser} />}>
        <VenuesBrowser {...browser} />
      </Suspense>
    </main>
  )
}
