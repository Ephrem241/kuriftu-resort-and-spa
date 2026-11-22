import { CircleCheck } from "lucide-react"

import { MediaImage } from "@/components/ui/media-image"
import type { ContentImage } from "@/lib/content/types"

/** Beige "Special Features" card with a check list and a photo fading in from the right. */
export function RoomFeatures({ features, image }: { features: string[]; image: ContentImage }) {
  return (
    <section
      aria-labelledby="features-title"
      className="relative isolate flex min-h-64 overflow-hidden rounded-xl bg-beige lg:min-h-[17.5rem]"
    >
      <div className="absolute inset-y-0 right-0 -z-10 w-[70%]">
        <MediaImage image={image} sizes="(min-width: 1025px) 45vw, 70vw" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-beige via-beige/85 to-beige/0" />

      <div className="flex flex-col justify-center p-8 lg:p-10">
        <h2 id="features-title" className="text-h3 lg:text-[2.125rem]">
          Special Features
        </h2>
        <ul className="mt-5 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-small text-charcoal md:text-body">
              <CircleCheck aria-hidden="true" strokeWidth={2} className="size-5 shrink-0 fill-forest text-ivory" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
