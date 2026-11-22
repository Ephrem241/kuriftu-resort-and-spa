"use client"

import { useId, useState } from "react"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { RoomSummary } from "@/lib/content/types"
import { cn } from "@/lib/utils"

import { RoomCard } from "./room-card"

const VISIBLE = 3

/** "Our Rooms": three cards on desktop, the rest revealed in place. */
export function ResortRooms({ rooms }: { rooms: RoomSummary[] }) {
  const [expanded, setExpanded] = useState(false)
  const listId = useId()
  if (rooms.length === 0) return null
  const hasMore = rooms.length > VISIBLE

  return (
    <section
      aria-labelledby="rooms-title"
      className="container-site grid gap-8 pt-16 lg:grid-cols-[minmax(0,17rem)_1fr] lg:items-center lg:gap-10 lg:pt-14"
    >
      <div>
        <h2 id="rooms-title" className="text-h3 lg:text-[2.125rem]">
          Our Rooms
        </h2>
        <p className="mt-3 max-w-60 text-small text-charcoal">
          Choose from a variety of elegant rooms and suites, designed for your comfort and relaxation.
        </p>
        {hasMore && !expanded ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded(true)}
            className={cn(buttonVariants({ variant: "primary", size: "pill", shape: "pill" }), "mt-6 hidden lg:inline-flex")}
          >
            View All Rooms
            <ArrowRight
              aria-hidden="true"
              strokeWidth={1.5}
              className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
            />
          </button>
        ) : null}
      </div>

      {/* Scroll-snap row below 1025px; three columns on desktop. */}
      <ul
        id={listId}
        aria-label="Rooms"
        className="-mx-[5.5%] flex snap-x snap-mandatory scroll-px-[5%] lg:scroll-px-0 gap-4 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {rooms.map((room, i) => (
          <li
            key={room.slug}
            className={cn(
              "w-[75%] shrink-0 snap-start md:w-[40%] lg:w-auto",
              i >= VISIBLE && !expanded && "lg:hidden"
            )}
          >
            <RoomCard room={room} />
          </li>
        ))}
      </ul>
    </section>
  )
}
