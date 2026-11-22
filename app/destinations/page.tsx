import type { Metadata } from "next"

import { AvailabilityBar } from "@/components/booking/availability-bar"
import { DestinationGroup } from "@/components/destinations/destination-group"
import { PageHero } from "@/components/ui/page-hero"
import { getDestinationsPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

function fallbackDescription(brandName: string) {
  return `Resorts, spas and adventure parks of ${brandName} across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getDestinationsPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/destinations",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Every Kuriftu property, as resorts & spas then adventure & wellness. */
export default async function DestinationsPage() {
  const settings = await getSiteSettings()
  const page = await getDestinationsPage(fallbackDescription(settings.brandName))
  const firstGroup = page.groups[0]?.id

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="destinations-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Explore Destinations", href: firstGroup ? `#${firstGroup}` : "#main" }}
      />

      <div className="relative z-20 container-site -mt-4 lg:-mt-16">
        <AvailabilityBar destinations={settings.bookableResorts} source="destinations" />
      </div>

      <div className="flex flex-col gap-16 pt-14 pb-16 lg:gap-20 lg:pt-16 lg:pb-20">
        {page.groups.map((group) => (
          <DestinationGroup key={group.id} group={group} />
        ))}
      </div>
    </main>
  )
}
