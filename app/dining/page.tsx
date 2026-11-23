import { Suspense } from "react"
import type { Metadata } from "next"

import { DiningEvents } from "@/components/dining/dining-events"
import { DiningExperience } from "@/components/dining/dining-experience"
import { MenuHighlights } from "@/components/dining/menu-highlights"
import { RestaurantsBrowser, RestaurantsBrowserFallback } from "@/components/dining/restaurants-browser"
import { PageHero } from "@/components/ui/page-hero"
import { getDiningPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const RESTAURANTS_ID = "restaurants"

function fallbackDescription(brandName: string) {
  return `Restaurants, bars and lakeside dining at ${brandName} across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getDiningPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/dining",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? page.venues[0]?.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Dining: every restaurant (filterable by `?resort=`), menus, dining events and the reserve-a-table band. */
export default async function DiningPage() {
  const settings = await getSiteSettings()
  const page = await getDiningPage(fallbackDescription(settings.brandName))

  const browser = {
    id: RESTAURANTS_ID,
    heading: page.restaurants,
    venues: page.venues,
    reserve: page.reserve,
    settings: { reservationPhone: settings.reservationPhone, reservationEmail: settings.reservationEmail },
  }
  // Server-rendered sections that sit between the restaurants and the reserve band.
  const between = (
    <>
      {page.highlights ? <MenuHighlights content={page.highlights} menuHref={`#${RESTAURANTS_ID}`} /> : null}
      {page.events ? <DiningEvents content={page.events} /> : null}
    </>
  )

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="dining-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Explore Our Restaurants", href: `#${RESTAURANTS_ID}` }}
      />

      {page.experience ? <DiningExperience content={page.experience} /> : null}

      {/* `?resort=` is read in the browser; the static HTML lists every restaurant. */}
      <Suspense fallback={<RestaurantsBrowserFallback {...browser}>{between}</RestaurantsBrowserFallback>}>
        <RestaurantsBrowser {...browser}>{between}</RestaurantsBrowser>
      </Suspense>
    </main>
  )
}
