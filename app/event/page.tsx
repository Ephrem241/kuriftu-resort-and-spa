import type { Metadata } from "next"
import { CalendarDays } from "lucide-react"

import { EventEnquiry } from "@/components/events/event-enquiry"
import { EventPackages } from "@/components/events/event-packages"
import { EventTypes } from "@/components/events/event-types"
import { VenuesFeature } from "@/components/events/venues-feature"
import { PageHero } from "@/components/ui/page-hero"
import { getEventsPage, getSiteSettings } from "@/lib/content"
import { ENQUIRY_ANCHOR } from "@/lib/content/events"
import { pageMetadata } from "@/lib/seo/metadata"

const VENUES_ID = "venues"

function fallbackDescription(brandName: string) {
  return `Weddings, meetings, conferences and celebrations at ${brandName} venues across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getEventsPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/event",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Celebrations & Events: event types, venues, packages, and the enquiry form. */
export default async function EventsPage() {
  const settings = await getSiteSettings()
  const page = await getEventsPage(fallbackDescription(settings.brandName))

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="events-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Explore Our Venues", href: `#${VENUES_ID}` }}
        secondaryCta={{ label: "Inquire Now", href: `#${ENQUIRY_ANCHOR}`, icon: CalendarDays }}
      />

      <EventTypes id="event-types" content={page.eventTypes} />

      <VenuesFeature id={VENUES_ID} content={page.venues} />

      <EventPackages id="event-packages" content={page.packages} />

      <EventEnquiry
        id={ENQUIRY_ANCHOR}
        content={page.enquiry}
        packages={page.packageOptions}
        resorts={page.venueResorts}
        reservationPhone={settings.reservationPhone}
      />
    </main>
  )
}
