import { BedDouble, Mountain, Scan, Users, type LucideIcon } from "lucide-react"

import type { RoomFact } from "@/lib/content/room-facts"

const FACTS: Record<RoomFact["key"], { icon: LucideIcon; name: string }> = {
  bed: { icon: BedDouble, name: "Beds" },
  guests: { icon: Users, name: "Guests" },
  size: { icon: Scan, name: "Size" },
  view: { icon: Mountain, name: "View" },
}

/** Beige card of room facts split by dividers; hidden when there are none. */
export function RoomFacts({ facts }: { facts: RoomFact[] }) {
  if (facts.length === 0) return null

  return (
    <dl className="mt-8 flex w-fit max-w-full flex-wrap gap-y-5 rounded-lg bg-beige/70 px-2 py-5 lg:max-w-[23rem]">
      {facts.map((fact) => {
        const { icon: Icon, name } = FACTS[fact.key]
        return (
          <div
            key={fact.key}
            className="flex min-w-[5.5rem] flex-1 flex-col items-center gap-2 border-l border-line px-3 text-center first:border-l-0"
          >
            <dt>
              <Icon aria-hidden="true" strokeWidth={1.5} className="size-6 text-forest" />
              <span className="sr-only">{name}</span>
            </dt>
            <dd className="text-caption text-charcoal">{fact.label}</dd>
          </div>
        )
      })}
    </dl>
  )
}
