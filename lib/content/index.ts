import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { client } from "@/sanity/lib/client"
import { sanityFetch } from "@/sanity/lib/fetch"
import {
  CONTACT_PAGE_QUERY,
  DESTINATIONS_PAGE_QUERY,
  DINING_PAGE_QUERY,
  GALLERY_PAGE_QUERY,
  EVENT_PACKAGE_QUERY,
  EVENT_PACKAGE_SLUGS_QUERY,
  EVENTS_PAGE_QUERY,
  EXPERIENCE_PAGE_QUERY,
  EXPERIENCE_SLUGS_QUERY,
  EXPERIENCES_PAGE_QUERY,
  HOME_PAGE_QUERY,
  OFFER_PAGE_QUERY,
  OFFERS_QUERY,
  OFFERS_PAGE_QUERY,
  PAGE_QUERY,
  PAGE_SLUGS_QUERY,
  RESORT_PAGE_QUERY,
  RESORT_SLUGS_QUERY,
  ROOM_PAGE_QUERY,
  ROOM_PARAMS_QUERY,
  SITE_SETTINGS_QUERY,
  SITEMAP_QUERY,
  TREATMENTS_PAGE_QUERY,
  VENUES_PAGE_QUERY,
  WELLNESS_PAGE_QUERY,
} from "@/sanity/queries"

import {
  mapContactPage,
  mapDestinationsPage,
  mapDiningPage,
  mapGalleryPage,
  mapEventPackagePage,
  mapEventsPage,
  mapExperiencePage,
  mapExperiencesPage,
  mapHomePage,
  mapOffer,
  mapOfferPage,
  mapOffersPage,
  mapPage,
  mapResortPage,
  mapRoomPage,
  mapSiteSettings,
  mapSitemap,
  mapTreatmentsPage,
  mapVenuesPage,
  mapWellnessPage,
} from "./map"
import { cacheSeconds, isLive, type Dated } from "./offers"
import type {
  ContactPage,
  DestinationsPage,
  DiningPage,
  GalleryPage,
  EventPackagePage,
  EventsPage,
  ExperiencePage,
  ExperiencesPage,
  HomePage,
  MarketingPage,
  OfferPage,
  OffersPage,
  OfferSummary,
  ResortPage,
  RoomPage,
  SiteSettings,
  SitemapEntry,
  TreatmentsPage,
  VenuesPage,
  WellnessPage,
} from "./types"

/**
 * Server-only content access. Each getter is cached and tagged with the
 * document types it reads; the revalidate webhook expires those tags.
 *
 * A missing singleton is an error: the build fails loudly rather than
 * rendering placeholder content.
 */

/** Types any link or card on a page can point at. */
const LINKED_TYPES = ["resort", "room", "experience", "spaTreatment", "eventPackage", "offer", "page"]

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache"
  const tags = ["siteSettings", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: SITE_SETTINGS_QUERY, tags })
  const year = new Date().getFullYear()
  if (!doc) throw missing("siteSettings")
  return mapSiteSettings(doc, year)
}

export async function getHomePage(): Promise<HomePage> {
  "use cache"
  const tags = ["homePage", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: HOME_PAGE_QUERY, tags })
  if (!doc) throw missing("homePage")
  return mapHomePage(doc)
}

/** Every resort slug, read from the API (not the CDN) for static params. */
export async function getResortSlugs(): Promise<string[]> {
  "use cache"
  cacheTag("resort")
  cacheLife("days")
  return client.withConfig({ useCdn: false }).fetch(RESORT_SLUGS_QUERY)
}

/** One resort with its rooms, experiences, spa and dining; null if unknown. */
export async function getResortPage(slug: string): Promise<ResortPage | null> {
  "use cache"
  const tags = ["resort", `resort:${slug}`, "room", "experience", "spaTreatment", "diningVenue"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: RESORT_PAGE_QUERY, params: { slug }, tags })
  return doc ? mapResortPage(doc) : null
}

/** Every { slug, room } pair, read from the API (not the CDN) for static params. */
export async function getRoomParams(): Promise<{ slug: string; room: string }[]> {
  "use cache"
  cacheTag("room", "resort")
  cacheLife("days")
  const rows = await client.withConfig({ useCdn: false }).fetch(ROOM_PARAMS_QUERY)
  return rows.flatMap((r) => (r.slug && r.room ? [{ slug: r.slug, room: r.room }] : []))
}

/** One room of one resort, with sibling rooms; null if unknown or at another resort. */
export async function getRoomPage(resort: string, room: string): Promise<RoomPage | null> {
  "use cache"
  const tags = ["room", `room:${room}`, "resort", `resort:${resort}`]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: ROOM_PAGE_QUERY, params: { resort, room }, tags })
  return doc ? mapRoomPage(doc) : null
}

/** Indexable home, resort and room paths with their last change, for sitemap.xml. */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  "use cache"
  const tags = ["homePage", "resort", "room", "experience", "wellnessPage", "diningPage", "eventsPage", "eventPackage", "page", "contactPage", "galleryPage"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: SITEMAP_QUERY, tags })
  return mapSitemap(doc)
}

/**
 * Live offers, ending soonest first. Cached only until the next offer starts
 * or ends, so offers appear and expire without a deploy; publishing in Sanity
 * also expires the `offer` tag at once.
 */
export async function getOffers(): Promise<OfferSummary[]> {
  "use cache"
  cacheTag("offer", "resort")

  const now = new Date()
  // Direct fetch: $now is unique per call, so an inner cached fetch would never hit.
  const docs = await client.fetch(OFFERS_QUERY, { now: now.toISOString() })
  const offers = docs.map(mapOffer)
  cacheLife(offerLifetime(offers, now))
  return offers.filter((o) => isLive(o, now))
}

/** One live offer; null if unknown, not started or ended. */
export async function getOfferPage(slug: string): Promise<OfferPage | null> {
  "use cache"
  const tags = ["offer", `offer:${slug}`, "resort"]
  cacheTag(...tags)

  const doc = await sanityFetch({ query: OFFER_PAGE_QUERY, params: { slug }, tags })
  const now = new Date()
  if (!doc) {
    cacheLife("days")
    return null
  }
  cacheLife(offerLifetime([doc], now))
  return isLive(doc, now) ? mapOfferPage(doc) : null
}

/** Hero, banner and SEO copy for /offers; renders with fallbacks if unpublished. */
export async function getOffersPage(fallbackDescription: string): Promise<OffersPage> {
  "use cache"
  const tags = ["offersPage", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: OFFERS_PAGE_QUERY, tags })
  return mapOffersPage(doc, fallbackDescription)
}

/** Hero and SEO copy for /destinations with every resort, grouped; renders with fallbacks if unpublished. */
export async function getDestinationsPage(fallbackDescription: string): Promise<DestinationsPage> {
  "use cache"
  const tags = ["destinationsPage", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: DESTINATIONS_PAGE_QUERY, tags })
  return mapDestinationsPage(doc, fallbackDescription)
}

/** Hero and SEO copy for /experience with every experience; renders with fallbacks if unpublished. */
export async function getExperiencesPage(fallbackDescription: string): Promise<ExperiencesPage> {
  "use cache"
  const tags = ["experiencesPage", "experience", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: EXPERIENCES_PAGE_QUERY, tags })
  return mapExperiencesPage(doc, fallbackDescription)
}

/** Every experience slug, read from the API (not the CDN) for static params. */
export async function getExperienceSlugs(): Promise<string[]> {
  "use cache"
  cacheTag("experience")
  cacheLife("days")
  return client.withConfig({ useCdn: false }).fetch(EXPERIENCE_SLUGS_QUERY)
}

/** One experience with where it is offered and related experiences; null if unknown. */
export async function getExperiencePage(slug: string): Promise<ExperiencePage | null> {
  "use cache"
  const tags = ["experience", `experience:${slug}`, "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: EXPERIENCE_PAGE_QUERY, params: { slug }, tags })
  return doc ? mapExperiencePage(doc) : null
}

/** Copy for /wellness with every treatment (cards and form options); renders with fallbacks if unpublished. */
export async function getWellnessPage(fallbackDescription: string): Promise<WellnessPage> {
  "use cache"
  const tags = ["wellnessPage", "spaTreatment", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: WELLNESS_PAGE_QUERY, tags })
  return mapWellnessPage(doc, fallbackDescription)
}

/** Heading and SEO for /wellness/treatments with every treatment; renders with fallbacks if unpublished. */
export async function getTreatmentsPage(fallbackDescription: string): Promise<TreatmentsPage> {
  "use cache"
  const tags = ["wellnessPage", "spaTreatment", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: TREATMENTS_PAGE_QUERY, tags })
  return mapTreatmentsPage(doc, fallbackDescription)
}

/** Copy for /event with its package cards and the form presets; renders with fallbacks if unpublished. */
export async function getEventsPage(fallbackDescription: string): Promise<EventsPage> {
  "use cache"
  const tags = ["eventsPage", "eventVenue", "eventPackage", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: EVENTS_PAGE_QUERY, tags })
  return mapEventsPage(doc, fallbackDescription)
}

/** Heading and SEO for /event/venues with every venue; renders with fallbacks if unpublished. */
export async function getVenuesPage(fallbackDescription: string): Promise<VenuesPage> {
  "use cache"
  const tags = ["eventsPage", "eventVenue", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: VENUES_PAGE_QUERY, tags })
  return mapVenuesPage(doc, fallbackDescription)
}

/** Every event package slug, read from the API (not the CDN) for static params. */
export async function getEventPackageSlugs(): Promise<string[]> {
  "use cache"
  cacheTag("eventPackage")
  cacheLife("days")
  return client.withConfig({ useCdn: false }).fetch(EVENT_PACKAGE_SLUGS_QUERY)
}

/** One event package with its venues and related packages; null if unknown. */
export async function getEventPackagePage(slug: string): Promise<EventPackagePage | null> {
  "use cache"
  const tags = ["eventPackage", `eventPackage:${slug}`, "eventVenue", "eventsPage", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: EVENT_PACKAGE_QUERY, params: { slug }, tags })
  return doc ? mapEventPackagePage(doc) : null
}

/** Every marketing page slug, read from the API (not the CDN) for static params. */
export async function getPageSlugs(): Promise<string[]> {
  "use cache"
  cacheTag("page")
  cacheLife("days")
  return client.withConfig({ useCdn: false }).fetch(PAGE_SLUGS_QUERY)
}

/** One marketing page (About, Sustainability, …) with its sections; null if unknown. */
export async function getPage(slug: string): Promise<MarketingPage | null> {
  "use cache"
  const tags = ["page", `page:${slug}`, ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: PAGE_QUERY, params: { slug }, tags })
  return doc ? mapPage(doc) : null
}

/** Copy for /contact with the site and per-resort contacts; renders with fallbacks if unpublished. */
export async function getContactPage(fallbackDescription: string): Promise<ContactPage> {
  "use cache"
  const tags = ["contactPage", "siteSettings", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: CONTACT_PAGE_QUERY, tags })
  return mapContactPage(doc, fallbackDescription)
}

/** Copy for /gallery with every resort's gallery photos; renders with fallbacks if unpublished. */
export async function getGalleryPage(fallbackDescription: string): Promise<GalleryPage> {
  "use cache"
  const tags = ["galleryPage", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: GALLERY_PAGE_QUERY, tags })
  return mapGalleryPage(doc, fallbackDescription)
}

/** Revalidate at the next start or end. Next requires expire > revalidate. */
function offerLifetime(offers: Dated[], now: Date) {
  const seconds = cacheSeconds(offers, now)
  return { revalidate: seconds, expire: seconds + 1 }
}

function missing(type: string) {
  return new Error(`Missing published "${type}" document in Sanity`)
}

export type * from "./types"

/** Copy for /dining with every venue and its resort's reservation contact; renders with fallbacks if unpublished. */
export async function getDiningPage(fallbackDescription: string): Promise<DiningPage> {
  "use cache"
  const tags = ["diningPage", "diningVenue", "resort"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: DINING_PAGE_QUERY, tags })
  return mapDiningPage(doc, fallbackDescription)
}
