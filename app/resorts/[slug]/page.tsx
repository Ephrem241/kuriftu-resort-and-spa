import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ResortAbout } from "@/components/resort/resort-about"
import { ResortActivities } from "@/components/resort/resort-activities"
import { ResortAmenities } from "@/components/resort/resort-amenities"
import { ResortCta } from "@/components/resort/resort-cta"
import { ResortHero } from "@/components/resort/resort-hero"
import { ResortLocation } from "@/components/resort/resort-location"
import { ResortRooms } from "@/components/resort/resort-rooms"
import { JsonLd } from "@/components/seo/json-ld"
import { getResortPage, getResortSlugs, getSiteSettings } from "@/lib/content"
import { activityTiles } from "@/lib/content/activities"
import { pathForDocument } from "@/lib/content/routes"
import { resortJsonLd } from "@/lib/seo/json-ld"
import { pageMetadata } from "@/lib/seo/metadata"
import { absoluteUrl, siteUrl } from "@/lib/seo/site-url"
import { PageContentFallback } from "@/components/ui/page-content-fallback"

export async function generateStaticParams() {
  const slugs = await getResortSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/resorts/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const [resort, settings] = await Promise.all([getResortPage(slug), getSiteSettings()])
  if (!resort) notFound()

  return pageMetadata({
    title: resort.seo.title,
    description: resort.seo.description,
    path: resortPath(resort.slug),
    siteName: settings.brandName,
    image: resort.seo.image ?? resort.heroImage,
    noIndex: resort.seo.noIndex,
    titleAbsolute: true,
  })
}

function resortPath(slug: string) {
  return pathForDocument({ _type: "resort", slug }) ?? `/resorts/${encodeURIComponent(slug)}`
}

export default function Page({ params }: PageProps<"/resorts/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<PageContentFallback />}>
        <ResortContent params={params} />
      </Suspense>
    </main>
  )
}

async function ResortContent({ params }: Pick<PageProps<"/resorts/[slug]">, "params">) {
  const { slug } = await params
  const resort = await getResortPage(slug)
  if (!resort) notFound()

  return (
    <>
      <JsonLd data={resortJsonLd(resort, absoluteUrl(resortPath(resort.slug)), siteUrl())} />
      <ResortHero resort={resort} />
      <ResortAbout resort={resort} />
      <ResortAmenities amenities={resort.amenities} />
      <ResortRooms rooms={resort.rooms} />
      <ResortActivities tiles={activityTiles(resort)} resortSlug={resort.slug} />

      {/* Padding (not margins) so 5% is of the page width; the panel bleeds right on desktop. */}
      <div className="mt-16 mb-16 grid gap-10 px-[5%] lg:mt-14 lg:mb-14 lg:grid-cols-[1fr_minmax(0,44%)] lg:items-center lg:gap-8 lg:pr-0">
        <ResortLocation resort={resort} />
        <ResortCta resort={resort} />
      </div>
    </>
  )
}
