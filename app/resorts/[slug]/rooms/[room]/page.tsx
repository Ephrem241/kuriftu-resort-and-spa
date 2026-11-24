import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RoomAlsoLike } from "@/components/room/room-also-like"
import { RoomBookPanel } from "@/components/room/room-book-panel"
import { RoomFeatures } from "@/components/room/room-features"
import { RoomHero } from "@/components/room/room-hero"
import { RoomOverview } from "@/components/room/room-overview"
import { AmenityGrid } from "@/components/ui/amenity-grid"
import { getRoomPage, getRoomParams, getSiteSettings } from "@/lib/content"
import { pathForDocument } from "@/lib/content/routes"
import { pageMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"
import { PageContentFallback } from "@/components/ui/page-content-fallback"

/**
 * Both segments come from here: the resort page's generateStaticParams lives
 * in a page, not a layout, so it does not pass params down to this segment.
 */
export async function generateStaticParams() {
  return getRoomParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/resorts/[slug]/rooms/[room]">): Promise<Metadata> {
  const { slug, room: roomSlug } = await params
  const [room, settings] = await Promise.all([getRoomPage(slug, roomSlug), getSiteSettings()])
  if (!room) notFound()

  const path =
    pathForDocument({ _type: "room", slug: room.slug, resortSlug: room.resort.slug }) ??
    `/resorts/${encodeURIComponent(room.resort.slug)}/rooms/${encodeURIComponent(room.slug)}`

  return pageMetadata({
    title: room.seo.title,
    description: room.seo.description,
    path,
    siteName: settings.brandName,
    image: room.seo.image ?? room.images[0],
    noIndex: room.seo.noIndex,
    titleAbsolute: true,
  })
}

export default function Page({ params }: PageProps<"/resorts/[slug]/rooms/[room]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<PageContentFallback />}>
        <RoomContent params={params} />
      </Suspense>
    </main>
  )
}

async function RoomContent({ params }: Pick<PageProps<"/resorts/[slug]/rooms/[room]">, "params">) {
  const { slug, room: roomSlug } = await params
  const room = await getRoomPage(slug, roomSlug)
  if (!room) notFound()

  const hasFeatures = room.features.length > 0
  const sideImage = room.images[1] ?? room.images[0]

  return (
    <>
      <RoomHero room={room} />
      <RoomOverview room={room} />
      <AmenityGrid
        id="room-amenities"
        title="Room Amenities"
        subtitle="Everything you need for a comfortable stay"
        amenities={room.amenities}
        columns={8}
        className="pt-16 lg:pt-14"
      />

      <div
        className={cn(
          "container-site mt-16 grid gap-6 lg:mt-14",
          hasFeatures && "lg:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)]"
        )}
      >
        {hasFeatures ? <RoomFeatures features={room.features} image={sideImage} /> : null}
        <RoomBookPanel room={room} wide={!hasFeatures} image={sideImage} />
      </div>

      <RoomAlsoLike rooms={room.related} />
    </>
  )
}
