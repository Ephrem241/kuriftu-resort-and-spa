import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import type { WellnessPage } from "@/lib/content/types"

import { IconFeatures } from "./icon-features"

type WhyChooseContent = NonNullable<WellnessPage["whyChoose"]>

/** "Why Choose Kuriftu Spa?": four promises at left, a rounded photo at right. */
export function WhyChoose({ content }: { content: WhyChooseContent }) {
  return (
    <section
      aria-labelledby="why-choose-title"
      className="container-site grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,36%)] lg:gap-12 lg:py-16"
    >
      <div>
        <SectionHeading id="why-choose-title" title={content.title} />
        <IconFeatures features={content.features} className="mt-10" />
      </div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl lg:aspect-[16/10]">
        <MediaImage image={content.image} sizes="(min-width: 1025px) 36vw, 90vw" />
      </div>
    </section>
  )
}
