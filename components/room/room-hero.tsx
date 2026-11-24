import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { RoomPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** Room hero: back link, title and summary over the first room photo. */
export function RoomHero({ room }: { room: RoomPage }) {
  return (
    <section aria-labelledby="room-title" className="relative isolate flex flex-col overflow-hidden lg:block">
      {/* Image: right ~68% on desktop, full-width block below the copy on smaller screens. */}
      <div className="relative order-2 aspect-4/3 w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[68%]">
        <MediaImage image={room.images[0]} sizes="(min-width: 1025px) 68vw, 100vw" fetchPriority="high" />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-ivory via-ivory/70 to-transparent lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-ivory/80 to-transparent lg:hidden"
        />
      </div>

      <div className="relative z-10 order-1 container-site pt-32 pb-10 lg:flex lg:min-h-[36rem] lg:flex-col lg:justify-center lg:pt-36 lg:pb-24">
        <Link
          href={`/resorts/${encodeURIComponent(room.resort.slug)}#rooms`}
          className={cn(
            buttonVariants({ variant: "secondary", shape: "pill" }),
            "group/back h-9 gap-2 self-start border-forest/60 bg-ivory/70 px-5 font-bold"
          )}
        >
          <ArrowLeft
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-4 transition-transform duration-hover ease-soft group-hover/back:-translate-x-1"
          />
          Back to Rooms
        </Link>

        <h1 id="room-title" className="mt-5 max-w-xl text-[2.5rem] leading-[1.1] md:text-h1 lg:text-[3.25rem]">
          {room.title}
        </h1>
        {room.summary ? (
          <p className="mt-5 max-w-sm text-body text-charcoal lg:text-[1.0625rem]">{room.summary}</p>
        ) : null}
      </div>

      {/* Soft wave at the bottom edge on desktop (shape only, not brand artwork). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-10 hidden h-16 w-full fill-ivory lg:block"
      >
        <path d="M0 80V48c160-30 320-42 520-28 220 16 380 52 600 44 140-5 240-26 320-44v60z" />
      </svg>
    </section>
  )
}
