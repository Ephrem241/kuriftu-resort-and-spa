import { ContentCard } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { pathForDocument } from "@/lib/content/routes"
import type { RoomSummary } from "@/lib/content/types"

/** "You May Also Like": other rooms at the same resort. */
export function RoomAlsoLike({ rooms }: { rooms: RoomSummary[] }) {
  if (rooms.length === 0) return null

  return (
    <section aria-labelledby="also-like-title" className="container-site pt-16 pb-16 lg:pt-14 lg:pb-14">
      <SectionHeading id="also-like-title" title="You May Also Like" />
      {/* Scroll-snap row below 1025px; three columns on desktop. */}
      <ul className="-mx-[5.5%] mt-8 flex snap-x snap-mandatory scroll-px-[5%] gap-4 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:scroll-px-0 lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {rooms.map((room) => (
          <li key={room.slug} className="w-[80%] shrink-0 snap-start md:w-[45%] lg:w-auto">
            <ContentCard
              className="h-full shadow-sm"
              image={<MediaImage image={room.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 80vw" />}
              title={room.title}
              subtitle={room.summary}
              subtitleClassName="line-clamp-2"
              href={pathForDocument({ _type: "room", slug: room.slug, resortSlug: room.resortSlug }) ?? "#"}
              action="View Details"
              actionClassName="pt-4 text-small! font-bold normal-case! tracking-normal!"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
