import { ContentIcon } from "@/components/ui/content-icon"
import { SectionHeading } from "@/components/ui/section-heading"
import type { ResortPage } from "@/lib/content/types"

/** "Resort Amenities": icon circles with labels, as stored in Sanity. */
export function ResortAmenities({ amenities }: { amenities: ResortPage["amenities"] }) {
  if (amenities.length === 0) return null

  return (
    <section id="amenities" aria-labelledby="amenities-title" className="container-site scroll-mt-8 pt-16 lg:pt-14">
      <SectionHeading
        id="amenities-title"
        title="Resort Amenities"
        subtitle="Everything you need for a perfect stay"
      />
      <ul className="mt-8 grid grid-cols-2 gap-y-8 md:grid-cols-4 lg:grid-cols-7">
        {amenities.map((a) => (
          <li
            key={a.key}
            className="flex flex-col items-center gap-3 px-3 text-center lg:border-l lg:border-line lg:first:border-l-0 lg:[&:nth-child(7n+1)]:border-l-0"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-beige">
              <ContentIcon name={a.icon ?? "leaf"} strokeWidth={1.5} className="size-6 text-forest" />
            </span>
            <span className="max-w-36 text-small text-charcoal">{a.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
