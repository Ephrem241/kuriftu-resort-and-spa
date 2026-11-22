import { MediaImage } from "@/components/ui/media-image"
import type { WellnessPage } from "@/lib/content/types"

import { IconFeatures } from "./icon-features"

type DaySpa = NonNullable<WellnessPage["daySpa"]>

/** Boston Day Spa: photo at left, copy and four promises at right. */
export function DaySpa({ daySpa }: { daySpa: DaySpa }) {
  return (
    <section
      aria-labelledby="day-spa-title"
      className="container-site grid items-center gap-8 py-12 md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:py-16"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl lg:aspect-[16/9.5]">
        <MediaImage image={daySpa.image} sizes="(min-width: 1025px) 48vw, 90vw" className="animate-image-reveal" />
      </div>

      <div>
        {daySpa.eyebrow ? (
          <p className="eyebrow flex items-center gap-3 text-gold">
            <span aria-hidden="true" className="h-px w-6 bg-gold" />
            {daySpa.eyebrow}
            <span aria-hidden="true" className="h-px w-6 bg-gold" />
          </p>
        ) : null}
        <h2 id="day-spa-title" className="mt-3 text-h2 lg:text-[2.5rem] lg:leading-[1.15]">
          {daySpa.title}
        </h2>
        {daySpa.text ? <p className="mt-5 max-w-xl text-body text-charcoal">{daySpa.text}</p> : null}
        <IconFeatures features={daySpa.features} className="mt-8 lg:mt-10" />
      </div>
    </section>
  )
}
