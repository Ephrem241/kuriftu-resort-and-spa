import Link from "next/link"
import { ArrowRight, User } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import { pathForDocument } from "@/lib/content/routes"
import type { RoomSummary } from "@/lib/content/types"

/** Room card from the resort page: photo, title, guests and a round arrow. */
export function RoomCard({ room }: { room: RoomSummary }) {
  const href =
    pathForDocument({ _type: "room", slug: room.slug, resortSlug: room.resortSlug }) ?? "#"

  return (
    <Link
      href={href}
      className="group/room flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-sm transition-shadow duration-hover ease-soft hover:shadow-md"
    >
      <div className="relative aspect-[16/10.5] overflow-hidden bg-beige">
        <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/room:scale-105">
          <MediaImage image={room.image} sizes="(min-width: 1025px) 20vw, (min-width: 768px) 40vw, 75vw" />
        </div>
      </div>
      <div className="flex flex-1 items-end justify-between gap-3 px-4 py-4">
        <div>
          <h3 className="font-sans text-body font-bold text-charcoal">{room.title}</h3>
          {room.maxGuests ? (
            <p className="mt-1 flex items-center gap-1.5 text-caption text-muted">
              <User aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
              {room.maxGuests} Guests
            </p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-beige text-forest transition-colors duration-hover group-hover/room:bg-forest group-hover/room:text-ivory"
        >
          <ArrowRight strokeWidth={1.5} className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}
