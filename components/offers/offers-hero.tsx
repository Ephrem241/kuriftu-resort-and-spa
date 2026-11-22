import { PageHero } from "@/components/ui/page-hero"
import type { OffersPage } from "@/lib/content/types"

/** Offers hero: copy on ivory at left, the page photo full bleed behind it on the right. */
export function OffersHero({ hero, targetId }: { hero: OffersPage["hero"]; targetId: string }) {
  return (
    <PageHero
      titleId="offers-hero-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      intro={hero.intro}
      image={hero.image}
      cta={{ label: "Explore Offers", href: `#${targetId}` }}
    />
  )
}
