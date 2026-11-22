import { ContentCard } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import type { WellnessPage } from "@/lib/content/types"
import { treatmentGroupHref } from "@/lib/content/wellness"

type TreatmentGroupsProps = {
  id: string
  content: WellnessPage["treatments"]
}

/** "Our Spa Treatments": one card per treatment group, each opening that group's treatments. */
export function TreatmentGroups({ id, content }: TreatmentGroupsProps) {
  if (content.cards.length === 0) return null
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 py-12 lg:py-14">
      <SectionHeading id={`${id}-title`} title={content.title} subtitle={content.subtitle || undefined} />
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-5">
        {content.cards.map((card) => (
          <li key={card.key} className="flex animate-slide-up">
            <ContentCard
              className="w-full text-center shadow-sm"
              image={
                <MediaImage
                  image={card.image}
                  sizes="(min-width: 1440px) 18vw, (min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw"
                />
              }
              title={card.title}
              subtitle={card.subtitle || undefined}
              subtitleClassName="text-muted"
              href={treatmentGroupHref(card.group)}
              action="Learn More"
              actionClassName="self-center pt-4 text-small font-bold normal-case tracking-normal text-charcoal hover:text-forest"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
