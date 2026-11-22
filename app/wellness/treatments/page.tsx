import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { TreatmentsBrowser, TreatmentsBrowserFallback } from "@/components/wellness/treatments-browser"
import { getSiteSettings, getTreatmentsPage } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

const GRID_ID = "treatment-list"

function fallbackDescription(brandName: string) {
  return `Massages, facials, body treatments, beauty services and wellness packages at ${brandName}.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getTreatmentsPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/wellness/treatments",
    siteName: settings.brandName,
    image: page.seo.image ?? page.image ?? page.treatments[0]?.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Every spa treatment, filterable by group and destination (`?category=`, `?resort=`). */
export default async function TreatmentsPage() {
  const settings = await getSiteSettings()
  const page = await getTreatmentsPage(fallbackDescription(settings.brandName))
  const browser = { treatments: page.treatments, id: GRID_ID }

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <header className="container-site animate-fade-in pt-32 pb-8 lg:pt-36 lg:pb-10">
        <Link
          href="/wellness"
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
          Wellness &amp; Spa
        </Link>
        <p className="eyebrow mt-8 flex items-center gap-3 text-forest">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {page.eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl">{page.title}</h1>
        {page.intro ? <p className="mt-4 max-w-xl text-body text-charcoal">{page.intro}</p> : null}
      </header>

      {/* The URL filters are read in the browser; the static HTML lists every treatment. */}
      <Suspense fallback={<TreatmentsBrowserFallback {...browser} />}>
        <TreatmentsBrowser {...browser} />
      </Suspense>
    </main>
  )
}
