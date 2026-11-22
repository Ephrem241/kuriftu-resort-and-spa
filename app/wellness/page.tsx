import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"

import { PageHero } from "@/components/ui/page-hero"
import { DaySpa } from "@/components/wellness/day-spa"
import { SpaBooking } from "@/components/wellness/spa-booking"
import { TreatmentGroups } from "@/components/wellness/treatment-groups"
import { WhyChoose } from "@/components/wellness/why-choose"
import { getSiteSettings, getWellnessPage } from "@/lib/content"
import { groupsIn, treatmentOptions } from "@/lib/content/wellness"
import { pageMetadata } from "@/lib/seo/metadata"

const TREATMENTS_ID = "treatments"
const BOOKING_ID = "spa-booking"

function fallbackDescription(brandName: string) {
  return `Spa treatments and holistic wellness at ${brandName} and Boston Day Spa in Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getWellnessPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/wellness",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Wellness & Spa: the day spa, treatment groups, the booking request form, and why Kuriftu. */
export default async function WellnessPage() {
  const settings = await getSiteSettings()
  const page = await getWellnessPage(fallbackDescription(settings.brandName))

  // A card only shows when its group has treatments to list.
  const groups = new Set(groupsIn(page.treatmentList).map((g) => g.value))
  const treatments = { ...page.treatments, cards: page.treatments.cards.filter((c) => groups.has(c.group)) }

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="wellness-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Explore Spa Treatments", href: `#${TREATMENTS_ID}` }}
        secondaryCta={{ label: "Book a Spa Session", href: `#${BOOKING_ID}`, icon: CalendarDays }}
      />

      {page.daySpa ? <DaySpa daySpa={page.daySpa} /> : null}

      <TreatmentGroups id={TREATMENTS_ID} content={treatments} />

      <SpaBooking
        id={BOOKING_ID}
        content={page.booking}
        options={treatmentOptions(page.treatmentList)}
        reservationPhone={settings.reservationPhone}
      />

      {page.whyChoose ? <WhyChoose content={page.whyChoose} /> : null}
    </main>
  )
}
