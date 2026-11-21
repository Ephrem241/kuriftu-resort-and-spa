import type { Metadata } from "next"

import { AvailabilityBar } from "@/components/booking/availability-bar"
import { Destinations } from "@/components/home/destinations"
import { Experience } from "@/components/home/experience"
import { FeaturedRooms } from "@/components/home/featured-rooms"
import { GuestsBand } from "@/components/home/guests-band"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { OffersPanel } from "@/components/home/offers-panel"
import { SectionHeading } from "@/components/ui/section-heading"
import { getHomePage, getSiteSettings } from "@/lib/content"
import { toEmbedUrl } from "@/lib/video"

export const metadata: Metadata = {
  title: { absolute: "Kuriftu Resorts & Spa | Ethiopia, Your Way" },
  description:
    "Luxury resorts, spas, and adventure parks across Ethiopia. Discover Bishoftu, Awash Falls, Entoto, Lake Tana, and Arba Minch, and book your stay.",
}

export default async function Home() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <HeroCarousel slides={home.heroSlides} storyEmbedUrl={toEmbedUrl(settings.storyVideoUrl)} />

      <div className="relative z-20 container-site -mt-4 lg:-mt-16">
        <AvailabilityBar destinations={settings.bookableResorts} source="home-hero" />
      </div>

      <Destinations content={home.destinations} />

      <Experience content={home.experience} />

      <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_minmax(0,38%)] lg:items-center lg:gap-12">
        <section aria-labelledby="rooms-title" className="mx-[5%] lg:mr-0">
          <SectionHeading
            id="rooms-title"
            align="start"
            title={home.rooms.title}
            subtitle={home.rooms.subtitle}
          />
          <FeaturedRooms rooms={home.rooms.items} />
        </section>
        <div className="mx-[5%] lg:mx-0">
          <OffersPanel content={home.offersPanel} />
        </div>
      </div>

      <GuestsBand
        testimonials={home.testimonials}
        stayConnected={home.stayConnected}
        social={settings.social}
      />
    </main>
  )
}
