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
import { getResortPage, getResortSlugs } from "@/lib/content"
import { activityTiles } from "@/lib/content/activities"
import type { ContentImage } from "@/lib/content/types"

export async function generateStaticParams() {
  const slugs = await getResortSlugs()
  return slugs.map((slug) => ({ slug }))
}

/** Open Graph crop (1200×630) of a Sanity CDN image. */
function ogImage(image: ContentImage) {
  if (!image.src) return undefined
  const url = new URL(image.src)
  url.searchParams.set("w", "1200")
  url.searchParams.set("h", "630")
  url.searchParams.set("fit", "crop")
  return [{ url: url.toString(), width: 1200, height: 630, alt: image.alt }]
}

export async function generateMetadata({ params }: PageProps<"/resorts/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const resort = await getResortPage(slug)
  if (!resort) notFound()

  return {
    title: { absolute: resort.seo.title },
    description: resort.seo.description || undefined,
    openGraph: {
      title: resort.seo.title,
      description: resort.seo.description || undefined,
      images: ogImage(resort.heroImage),
    },
  }
}

export default function Page({ params }: PageProps<"/resorts/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<div aria-busy="true" className="min-h-[40rem]" />}>
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
