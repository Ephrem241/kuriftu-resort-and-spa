import { PortableText } from "@/components/ui/portable-text"
import { roomFacts } from "@/lib/content/room-facts"
import type { RoomPage } from "@/lib/content/types"
import { toEmbedUrl } from "@/lib/video"

import { RoomFacts } from "./room-facts"
import { RoomGallery } from "./room-gallery"

/** "Room Overview": description, facts card and the photo gallery. */
export function RoomOverview({ room }: { room: RoomPage }) {
  return (
    <section
      aria-labelledby="overview-title"
      className="container-site grid grid-cols-[minmax(0,1fr)] gap-10 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start lg:gap-12 lg:pt-6"
    >
      <div className="lg:pt-2">
        <p className="eyebrow flex items-center gap-3 text-charcoal">
          <span aria-hidden="true" className="h-px w-5 bg-gold" />
          Room Overview
        </p>
        {room.overviewTitle ? (
          <h2 id="overview-title" className="mt-3 max-w-md text-h3 lg:text-[2.125rem] lg:leading-[1.2]">
            {room.overviewTitle}
          </h2>
        ) : (
          <h2 id="overview-title" className="sr-only">
            About the {room.title}
          </h2>
        )}
        <PortableText value={room.description} className="mt-5 max-w-lg text-small text-charcoal md:text-body" />
        <RoomFacts facts={roomFacts(room)} />
      </div>

      <RoomGallery title={room.title} images={room.images} embedUrl={toEmbedUrl(room.videoUrl)} />
    </section>
  )
}
