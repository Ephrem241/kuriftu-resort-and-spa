import type {
  DESTINATIONS_PAGE_QUERY_RESULT,
  EXPERIENCE_PAGE_QUERY_RESULT,
  EXPERIENCES_PAGE_QUERY_RESULT,
  HOME_PAGE_QUERY_RESULT,
  OFFER_PAGE_QUERY_RESULT,
  OFFERS_PAGE_QUERY_RESULT,
  OFFERS_QUERY_RESULT,
  RESORT_PAGE_QUERY_RESULT,
  ROOM_PAGE_QUERY_RESULT,
  SITEMAP_QUERY_RESULT,
  TREATMENTS_PAGE_QUERY_RESULT,
  WELLNESS_PAGE_QUERY_RESULT,
  EVENTS_PAGE_QUERY_RESULT,
  VENUES_PAGE_QUERY_RESULT,
  EVENT_PACKAGE_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  PAGE_QUERY_RESULT,
} from "@/sanity.types"
import { urlFor } from "@/sanity/lib/image"
import { toEmbedUrl } from "@/lib/video"

import { groupDestinations } from "./destinations"
import { isIconName } from "./icons"
import { isOfferCategory } from "./offers"
import { hrefFor, pathForDocument, type ContentLink } from "./routes"
import { isEventType, isPackageKind } from "./events"
import { excerpt, isTreatmentGroup } from "./wellness"
import type {
  Amenity,
  ContentImage,
  DestinationsPage,
  ExperiencePage,
  ExperienceResort,
  ExperiencesPage,
  ExperienceSummary,
  HomePage,
  NavLink,
  OfferCategory,
  OfferPage,
  OfferResort,
  OffersPage,
  OfferSummary,
  PageSeo,
  PostalAddress,
  PropertyContact,
  ResortPage,
  RoomPage,
  ResortSummary,
  RichText,
  RoomSummary,
  SiteSettings,
  SitemapEntry,
  SocialPlatform,
  IconFeature,
  TreatmentsPage,
  TreatmentSummary,
  WellnessPage,
  DisplayPrice,
  EventPackagePage,
  EventsPage,
  PackageSummary,
  VenueSummary,
  VenuesPage,
  MarketingPage,
  PageSection,
} from "./types"

/**
 * Query result → component shape. Missing optional content becomes an empty
 * value, never invented copy.
 */

type SanityImage = {
  alt?: string | null
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null
  hotspot?: { x?: number; y?: number } | null
  asset?: {
    _id: string
    url?: string | null
    metadata?: { lqip?: string | null } | null
  } | null
} | null

/** Largest width we ever request; next/image picks smaller ones from `sizes`. */
const MAX_WIDTH = 2560

export function toContentImage(image: SanityImage | undefined, fallbackAlt = ""): ContentImage {
  const alt = image?.alt?.trim() || fallbackAlt
  if (!image?.asset?._id) return { alt }

  const src = urlFor({
    asset: { _ref: image.asset._id },
    crop: image.crop ?? undefined,
    hotspot: image.hotspot ?? undefined,
  } as Parameters<typeof urlFor>[0])
    .width(MAX_WIDTH)
    .fit("max")
    .auto("format")
    .url()

  const { x, y } = image.hotspot ?? {}
  const objectPosition =
    typeof x === "number" && typeof y === "number"
      ? `${round(x * 100)}% ${round(y * 100)}%`
      : undefined

  return {
    src,
    alt,
    lqip: image.asset.metadata?.lqip ?? undefined,
    ...(objectPosition && { objectPosition }),
  }
}

const round = (n: number) => Math.round(n * 10) / 10

function toNavLinks(links: Array<ContentLink & { label: string }> | null | undefined): NavLink[] {
  return (links ?? []).map((link) => ({ label: link.label, href: hrefFor(link) }))
}

type SeoDoc = {
  title?: string | null
  description?: string | null
  noIndex?: boolean | null
  ogImage?: SanityImage
} | null | undefined

/** SEO fields with fallbacks for an empty title or description. */
export function mapSeo(seo: SeoDoc, fallback: { title: string; description: string }): PageSeo {
  return {
    title: seo?.title?.trim() || fallback.title,
    description: seo?.description?.trim() || fallback.description,
    image: seo?.ogImage?.asset ? toContentImage(seo.ogImage) : null,
    noIndex: seo?.noIndex === true,
  }
}

type AddressDoc = {
  streetAddress?: string | null
  locality?: string | null
  region?: string | null
  postalCode?: string | null
  country?: string | null
} | null | undefined

/** A postal address, or null without a town or city. */
export function mapAddress(doc: AddressDoc): PostalAddress | null {
  const locality = doc?.locality?.trim()
  if (!locality) return null
  return {
    street: doc?.streetAddress?.trim() ?? "",
    locality,
    region: doc?.region?.trim() ?? "",
    postalCode: doc?.postalCode?.trim() ?? "",
    country: doc?.country?.trim() ?? "",
  }
}

const PLATFORMS: SocialPlatform[] = ["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"]

type SettingsDoc = NonNullable<SITE_SETTINGS_QUERY_RESULT>

export function mapSiteSettings(
  doc: SettingsDoc,
  year: number
): SiteSettings {
  const address = doc.headOfficeAddress
    ? [doc.headOfficeAddress.locality, doc.headOfficeAddress.country].filter(Boolean).join(", ")
    : null

  return {
    brandName: doc.brandName,
    footerTagline: doc.footerTagline ?? "",
    reservationPhone: doc.reservationPhone ?? null,
    reservationEmail: doc.reservationEmail ?? null,
    address: address || null,
    headOfficeAddress: mapAddress(doc.headOfficeAddress),
    logo: doc.logo?.asset ? toContentImage(doc.logo, doc.brandName) : null,
    seo: mapSeo(doc.seo, { title: doc.brandName, description: "" }),
    social: (doc.social ?? []).filter((s) => PLATFORMS.includes(s.platform)),
    navResorts: (doc.navResorts ?? []).filter((r) => r.slug),
    bookableResorts: doc.bookableResorts.map((r) => ({
      name: r.name,
      slug: r.slug,
      bookingPropertyId: r.bookingPropertyId ?? null,
    })),
    experienceLinks: toNavLinks(doc.experienceLinks),
    footerColumns: (doc.footerColumns ?? []).map((col) => ({
      title: col.title,
      links: toNavLinks(col.links),
    })),
    legalLinks: toNavLinks(doc.legalLinks),
    storyVideoUrl: doc.storyVideoUrl ?? null,
    copyrightYear: year,
  }
}

type HomeDoc = NonNullable<HOME_PAGE_QUERY_RESULT>
/** The resort card fields both the home and destinations queries project. */
type ResortCard = Pick<
  NonNullable<NonNullable<HomeDoc["destinations"]>["resorts"]>[number],
  "name" | "slug" | "tagline" | "locationLabel" | "bookable" | "bookingPropertyId" | "heroImage"
>
type RoomCard = NonNullable<NonNullable<HomeDoc["rooms"]>["items"]>[number]

function mapResort(r: ResortCard): ResortSummary {
  return {
    name: r.name,
    slug: r.slug,
    tagline: r.tagline ?? r.locationLabel ?? "",
    image: toContentImage(r.heroImage, r.name),
    bookable: r.bookable ?? true,
    bookingPropertyId: r.bookingPropertyId ?? null,
  }
}

function mapRoom(r: RoomCard): RoomSummary | null {
  if (!r.resortSlug) return null
  return {
    title: r.title,
    slug: r.slug,
    resortSlug: r.resortSlug,
    summary: r.summary,
    maxGuests: r.maxGuests ?? null,
    sizeSqm: r.sizeSqm ?? null,
    image: toContentImage(r.image, r.title),
  }
}

export function mapHomePage(doc: HomeDoc): HomePage {
  const { destinations, experience, rooms, offersPanel, testimonials, stayConnected } = doc
  return {
    heroSlides: (doc.heroSlides ?? []).map((s) => ({
      eyebrow: s.eyebrow ?? "",
      title: s.title,
      text: s.text ?? "",
      image: toContentImage(s.image),
    })),
    destinations: {
      title: destinations?.title ?? "",
      subtitle: destinations?.subtitle ?? "",
      resorts: (destinations?.resorts ?? []).filter((r) => r.slug).map(mapResort),
    },
    experience: {
      title: experience?.title ?? "",
      pillars: (experience?.pillars ?? []).flatMap((p) =>
        isIconName(p.icon)
          ? [{ icon: p.icon, title: p.title, subtitle: p.subtitle ?? "", href: hrefFor(p.link) }]
          : []
      ),
      image: toContentImage(experience?.image),
    },
    rooms: {
      title: rooms?.title ?? "",
      subtitle: rooms?.subtitle ?? "",
      items: (rooms?.items ?? []).flatMap((r) => {
        const room = mapRoom(r)
        return room ? [room] : []
      }),
    },
    offersPanel: {
      title: offersPanel?.title ?? "",
      text: offersPanel?.text ?? "",
      ctaLabel: offersPanel?.ctaLabel ?? "",
      image: toContentImage(offersPanel?.image),
    },
    testimonials: {
      title: testimonials?.title ?? "",
      subtitle: testimonials?.subtitle ?? "",
      items: (testimonials?.items ?? []).map((t) => ({
        quote: t.quote,
        name: t.name,
        location: t.location ?? "",
        ...(t.avatar?.asset && { avatar: toContentImage(t.avatar, t.name) }),
      })),
      backgroundImage: toContentImage(testimonials?.backgroundImage),
    },
    stayConnected: {
      title: stayConnected?.title ?? "",
      subtitle: stayConnected?.subtitle ?? "",
    },
    seo: mapSeo(doc.seo, { title: "", description: "" }),
  }
}

type AmenityDoc = { _key: string; icon?: string | null; label: string }

function mapAmenities(amenities: AmenityDoc[] | null | undefined): Amenity[] {
  return (amenities ?? []).map((a) => ({
    key: a._key,
    icon: isIconName(a.icon) ? a.icon : null,
    label: a.label,
  }))
}

function mapContact(
  phone: { display?: string | null; tel?: string | null } | null | undefined,
  email: string | null | undefined
): PropertyContact {
  return {
    phone: phone?.display && phone.tel ? { display: phone.display, tel: phone.tel } : null,
    email: email ?? null,
  }
}

/** A text paragraph as Portable Text, for fallbacks. */
function paragraph(text: string, key: string): RichText {
  return [
    {
      _type: "block",
      _key: key,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `${key}-span`, text, marks: [] }],
    },
  ]
}

type RoomDoc = NonNullable<ROOM_PAGE_QUERY_RESULT>

export function mapRoomPage(doc: RoomDoc): RoomPage | null {
  const resort = doc.resort
  if (!resort?.slug) return null

  const resortHeading = resort.fullName?.trim() || resort.name
  const summary = doc.summary?.trim() ?? ""
  const images = (doc.images ?? [])
    .filter((img) => img.asset)
    .map((img, i) => toContentImage(img, `${doc.title}, photo ${i + 1}`))
  const description = (doc.description ?? []) as RichText
  const price = doc.fromPrice

  return {
    title: doc.title,
    slug: doc.slug,
    summary,
    overviewTitle: doc.overviewTitle?.trim() ?? "",
    description: description.length > 0 ? description : summary ? paragraph(summary, "summary") : [],
    videoUrl: doc.videoUrl ?? null,
    // Images are required in Studio; an alt-only placeholder covers a missing asset.
    images: images.length > 0 ? images : [toContentImage(null, doc.title)],
    maxGuests: doc.maxGuests ?? null,
    bedConfiguration: doc.bedConfiguration?.trim() ?? "",
    sizeSqm: doc.sizeSqm ?? null,
    view: doc.view?.trim() ?? "",
    amenities: mapAmenities(doc.amenities),
    features: (doc.features ?? []).map((f) => f.trim()).filter(Boolean),
    fromPrice:
      price?.amount && price.currency
        ? { amount: price.amount, currency: price.currency, unit: price.unit?.trim() ?? "" }
        : null,
    seo: mapSeo(doc.seo, { title: `${doc.title} | ${resortHeading}`, description: summary }),
    resort: {
      name: resort.name,
      heading: resortHeading,
      slug: resort.slug,
      bookable: resort.bookable ?? true,
      bookingPropertyId: resort.bookingPropertyId ?? null,
      ...mapContact(resort.phone, resort.email),
    },
    related: (doc.related ?? []).flatMap((r) => {
      const room = mapRoom(r)
      return room ? [room] : []
    }),
  }
}

type ResortDoc = NonNullable<RESORT_PAGE_QUERY_RESULT>

export function mapResortPage(doc: ResortDoc): ResortPage {
  const heading = doc.fullName?.trim() || doc.name
  const heroImage = toContentImage(doc.heroImage, heading)
  const [first, second] = doc.gallery ?? []
  const lat = doc.geo?.lat
  const lng = doc.geo?.lng

  return {
    name: doc.name,
    heading,
    slug: doc.slug,
    type: doc.type,
    locationLabel: doc.locationLabel,
    country: doc.country ?? "",
    address: mapAddress(doc.address),
    summary: doc.summary?.trim() ?? "",
    introTitle: doc.introTitle?.trim() || doc.tagline?.trim() || "",
    intro: (doc.intro ?? []) as RichText,
    amenities: mapAmenities(doc.amenities),
    geo: typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null,
    gettingHere: doc.gettingHere?.trim() ?? "",
    heroImage,
    aboutImage: first?.asset ? toContentImage(first, heading) : heroImage,
    ctaImage: second?.asset ? toContentImage(second, heading) : heroImage,
    heroVideoUrl: doc.heroVideoUrl ?? null,
    bookable: doc.bookable ?? true,
    bookingPropertyId: doc.bookingPropertyId ?? null,
    ...mapContact(doc.phone, doc.email),
    seo: mapSeo(doc.seo, { title: heading, description: doc.summary?.trim() || "" }),
    rooms: (doc.rooms ?? []).flatMap((r) => {
      const room = mapRoom(r)
      return room ? [room] : []
    }),
    experiences: (doc.experiences ?? []).flatMap((e) =>
      e.category && e.image?.asset ? [{ category: e.category, image: toContentImage(e.image) }] : []
    ),
    spaImage: doc.spaImage?.asset ? toContentImage(doc.spaImage) : null,
    diningImage: doc.diningImage?.asset ? toContentImage(doc.diningImage) : null,
  }
}

type OfferDoc = OFFERS_QUERY_RESULT[number]
type OfferResortDoc = NonNullable<OfferDoc["resorts"]>[number]

function mapOfferResorts(resorts: OfferResortDoc[] | null | undefined): OfferResort[] {
  return (resorts ?? [])
    .filter((r) => r.slug)
    .map((r) => ({
      name: r.name,
      heading: r.fullName?.trim() || r.name,
      slug: r.slug,
      bookable: r.bookable ?? true,
      bookingPropertyId: r.bookingPropertyId ?? null,
      ...mapContact(r.phone, r.email),
    }))
}

function mapOfferCategory(value: string | null | undefined): OfferCategory {
  return isOfferCategory(value) ? value : "deals"
}

export function mapOffer(doc: OfferDoc): OfferSummary {
  return {
    title: doc.title,
    slug: doc.slug,
    shortLine: doc.shortLine?.trim() ?? "",
    category: mapOfferCategory(doc.category),
    badge: doc.badge?.trim() ?? "",
    startDate: doc.startDate,
    endDate: doc.endDate,
    showAsPopup: doc.showAsPopup === true,
    image: toContentImage(doc.image, doc.title),
    resorts: mapOfferResorts(doc.resorts),
    noIndex: doc.seo?.noIndex === true,
    lastModified: doc._updatedAt,
  }
}

type OfferPageDoc = NonNullable<OFFER_PAGE_QUERY_RESULT>

export function mapOfferPage(doc: OfferPageDoc): OfferPage {
  const shortLine = doc.shortLine?.trim() ?? ""
  const image = toContentImage(doc.image, doc.title)
  return {
    title: doc.title,
    slug: doc.slug,
    shortLine,
    category: mapOfferCategory(doc.category),
    badge: doc.badge?.trim() ?? "",
    startDate: doc.startDate,
    endDate: doc.endDate,
    showAsPopup: doc.showAsPopup === true,
    image,
    description: (doc.description ?? []) as RichText,
    terms: (doc.terms ?? []) as RichText,
    promoCode: doc.promoCode?.trim() ?? "",
    seo: mapSeo(doc.seo, { title: doc.title, description: shortLine }),
    resorts: mapOfferResorts(doc.resorts),
  }
}

/** Destinations page copy and grouped resorts; null-safe so a missing singleton still renders. */
export function mapDestinationsPage(doc: DESTINATIONS_PAGE_QUERY_RESULT, fallbackDescription: string): DestinationsPage {
  const hero = doc.page?.hero
  const title = hero?.title?.trim() || "Destinations"
  const intro = hero?.intro?.trim() ?? ""
  const resorts = doc.resorts.flatMap((r) => (r.slug ? [{ ...r, slug: r.slug, type: r.type ?? null }] : []))
  return {
    hero: {
      eyebrow: hero?.eyebrow?.trim() || "Our Destinations",
      title,
      intro,
      image: hero?.image?.asset ? toContentImage(hero.image) : null,
    },
    groups: groupDestinations(resorts).map((g) => ({
      ...g,
      resorts: g.resorts.map(mapResort),
    })),
    seo: mapSeo(doc.page?.seo, { title, description: intro || fallbackDescription }),
  }
}

type ExperienceCardDoc = EXPERIENCES_PAGE_QUERY_RESULT["experiences"][number]

function mapExperienceResorts(
  resorts: { name: string; fullName: string | null; slug: string | null }[] | null | undefined
): ExperienceResort[] {
  return (resorts ?? []).flatMap((r) =>
    r?.slug ? [{ name: r.name, heading: r.fullName?.trim() || r.name, slug: r.slug }] : []
  )
}

export function mapExperience(doc: ExperienceCardDoc): ExperienceSummary {
  return {
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    summary: doc.summary?.trim() ?? "",
    duration: doc.duration?.trim() ?? "",
    image: toContentImage(doc.image, doc.title),
    resorts: mapExperienceResorts(doc.resorts),
  }
}

/** Experiences page copy and every experience; null-safe so a missing singleton still renders. */
export function mapExperiencesPage(doc: EXPERIENCES_PAGE_QUERY_RESULT, fallbackDescription: string): ExperiencesPage {
  const hero = doc.page?.hero
  const title = hero?.title?.trim() || "Experiences"
  const intro = hero?.intro?.trim() ?? ""
  return {
    hero: {
      eyebrow: hero?.eyebrow?.trim() || "Experiences",
      title,
      intro,
      image: hero?.image?.asset ? toContentImage(hero.image) : null,
    },
    experiences: doc.experiences.map(mapExperience),
    seo: mapSeo(doc.page?.seo, { title, description: intro || fallbackDescription }),
  }
}

type ExperiencePageDoc = NonNullable<EXPERIENCE_PAGE_QUERY_RESULT>

export function mapExperiencePage(doc: ExperiencePageDoc): ExperiencePage {
  const summary = doc.summary?.trim() ?? ""
  const images = (doc.images ?? [])
    .filter((img) => img.asset)
    .map((img, i) => toContentImage(img, `${doc.title}, photo ${i + 1}`))
  const description = (doc.description ?? []) as RichText

  return {
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    summary,
    duration: doc.duration?.trim() ?? "",
    // Images are required in Studio; an alt-only placeholder covers a missing asset.
    images: images.length > 0 ? images : [toContentImage(null, doc.title)],
    description: description.length > 0 ? description : summary ? paragraph(summary, "summary") : [],
    action: doc.action === "enquire" ? "enquire" : "book",
    seo: mapSeo(doc.seo, { title: doc.title, description: summary }),
    resorts: mapOfferResorts(doc.resorts),
    related: (doc.related ?? []).map(mapExperience),
  }
}

/** Offers page copy; null-safe so a missing singleton still renders. */
export function mapOffersPage(doc: OFFERS_PAGE_QUERY_RESULT, fallbackDescription: string): OffersPage {
  const hero = doc?.hero
  const banner = doc?.banner
  const title = hero?.title?.trim() || "Offers & Packages"
  const intro = hero?.intro?.trim() ?? ""
  return {
    hero: {
      eyebrow: hero?.eyebrow?.trim() || "Special Offers",
      title,
      intro,
      image: hero?.image?.asset ? toContentImage(hero.image) : null,
    },
    banner:
      banner?.title?.trim() && banner.image?.asset
        ? {
            eyebrow: banner.eyebrow?.trim() ?? "",
            title: banner.title.trim(),
            text: banner.text?.trim() ?? "",
            image: toContentImage(banner.image),
            link: banner.link ? { label: banner.link.label, href: hrefFor(banner.link) } : null,
          }
        : null,
    seo: mapSeo(doc?.seo, { title, description: intro || fallbackDescription }),
  }
}

/** Sitemap rows for live, indexable offers. */
export function offerSitemapEntries(offers: OfferSummary[]): SitemapEntry[] {
  return offers.flatMap((o) => {
    const path = o.noIndex ? null : pathForDocument({ _type: "offer", slug: o.slug })
    return path ? [{ path, lastModified: o.lastModified }] : []
  })
}

/** Indexable pages for sitemap.xml, home first; rows without a path are dropped. */
export function mapSitemap(doc: SITEMAP_QUERY_RESULT): SitemapEntry[] {
  const entries: SitemapEntry[] = []
  if (doc.home && !doc.home.noIndex) entries.push({ path: "/", lastModified: doc.home._updatedAt })
  for (const r of doc.resorts) {
    const path = pathForDocument({ _type: "resort", slug: r.slug })
    if (path) entries.push({ path, lastModified: r._updatedAt })
  }
  for (const r of doc.rooms) {
    const path = pathForDocument({ _type: "room", slug: r.slug, resortSlug: r.resortSlug })
    if (path) entries.push({ path, lastModified: r._updatedAt })
  }
  for (const e of doc.experiences) {
    const path = pathForDocument({ _type: "experience", slug: e.slug })
    if (path) entries.push({ path, lastModified: e._updatedAt })
  }
  if (doc.wellness) {
    const lastModified = doc.wellness._updatedAt
    if (!doc.wellness.noIndex) entries.push({ path: "/wellness", lastModified })
    if (!doc.wellness.treatmentsNoIndex) entries.push({ path: "/wellness/treatments", lastModified })
  }
  if (doc.events) {
    const lastModified = doc.events._updatedAt
    if (!doc.events.noIndex) entries.push({ path: "/event", lastModified })
    if (!doc.events.venuesNoIndex) entries.push({ path: "/event/venues", lastModified })
  }
  for (const p of doc.eventPackages) {
    const path = pathForDocument({ _type: "eventPackage", slug: p.slug })
    if (path) entries.push({ path, lastModified: p._updatedAt })
  }
  for (const p of doc.pages) {
    const path = pathForDocument({ _type: "page", slug: p.slug })
    if (path) entries.push({ path, lastModified: p._updatedAt })
  }
  return entries
}

type TreatmentCardDoc = WELLNESS_PAGE_QUERY_RESULT["treatments"][number]

export function mapTreatment(doc: TreatmentCardDoc): TreatmentSummary {
  const price = doc.price
  return {
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    excerpt: excerpt(doc.excerpt),
    duration: doc.duration?.trim() ?? "",
    price:
      price?.amount && price.currency
        ? { amount: price.amount, currency: price.currency, unit: price.unit?.trim() ?? "" }
        : null,
    image: toContentImage(doc.image, doc.title),
    resorts: mapExperienceResorts(doc.resorts),
  }
}

type FeatureDoc = { _key: string; icon?: string | null; title: string }

function mapIconFeatures(features: FeatureDoc[] | null | undefined): IconFeature[] {
  return (features ?? []).map((f) => ({ key: f._key, icon: isIconName(f.icon) ? f.icon : null, title: f.title }))
}

/** Wellness page copy and every treatment; null-safe so a missing singleton still renders. */
export function mapWellnessPage(doc: WELLNESS_PAGE_QUERY_RESULT, fallbackDescription: string): WellnessPage {
  const page = doc.page
  const hero = page?.hero
  const daySpa = page?.daySpa
  const booking = page?.booking
  const why = page?.whyChoose
  const title = hero?.title?.trim() || "Wellness & Spa"
  const intro = hero?.intro?.trim() ?? ""

  return {
    hero: {
      eyebrow: hero?.eyebrow?.trim() || "Wellness & Spa",
      title,
      intro,
      image: hero?.image?.asset ? toContentImage(hero.image) : null,
    },
    daySpa:
      daySpa?.title?.trim() && daySpa.image?.asset
        ? {
            eyebrow: daySpa.eyebrow?.trim() || daySpa.resort?.name || "",
            title: daySpa.title.trim(),
            text: daySpa.text?.trim() ?? "",
            image: toContentImage(daySpa.image),
            features: mapIconFeatures(daySpa.features),
          }
        : null,
    treatments: {
      title: page?.treatments?.title?.trim() || "Our Spa Treatments",
      subtitle: page?.treatments?.subtitle?.trim() ?? "",
      cards: (page?.treatments?.cards ?? []).flatMap((c) =>
        isTreatmentGroup(c.group) && c.image?.asset
          ? [
              {
                key: c._key,
                group: c.group,
                title: c.title,
                subtitle: c.subtitle?.trim() ?? "",
                image: toContentImage(c.image, c.title),
              },
            ]
          : []
      ),
    },
    booking: {
      eyebrow: booking?.eyebrow?.trim() || "Book a Spa Session",
      title: booking?.title?.trim() || "Spa Booking Request",
      text: booking?.text?.trim() ?? "",
      tagline: booking?.tagline?.trim() ?? "",
      image: booking?.image?.asset ? toContentImage(booking.image) : null,
    },
    whyChoose:
      why?.title?.trim() && why.image?.asset
        ? { title: why.title.trim(), features: mapIconFeatures(why.features), image: toContentImage(why.image) }
        : null,
    treatmentList: doc.treatments.map(mapTreatment),
    seo: mapSeo(page?.seo, { title, description: intro || fallbackDescription }),
  }
}

/** Treatments page heading and every treatment; null-safe so a missing singleton still renders. */
export function mapTreatmentsPage(doc: TREATMENTS_PAGE_QUERY_RESULT, fallbackDescription: string): TreatmentsPage {
  const index = doc.page?.treatmentsIndex
  const title = index?.title?.trim() || "Spa Treatments"
  const intro = index?.intro?.trim() ?? ""
  const image = doc.page?.fallbackImage
  return {
    eyebrow: index?.eyebrow?.trim() || "Wellness & Spa",
    title,
    intro,
    treatments: doc.treatments.map(mapTreatment),
    image: image?.asset ? toContentImage(image) : null,
    seo: mapSeo(doc.page?.treatmentsSeo, { title, description: intro || fallbackDescription }),
  }
}

type PriceDoc = { amount?: number | null; currency?: string | null; unit?: string | null } | null | undefined

function mapPrice(price: PriceDoc): DisplayPrice {
  return price?.amount && price.currency
    ? { amount: price.amount, currency: price.currency, unit: price.unit?.trim() ?? "" }
    : null
}

type VenueDoc = NonNullable<VENUES_PAGE_QUERY_RESULT["venues"][number]>

/** A venue card; null when its resort has no slug (it can't be filtered or enquired about). */
export function mapVenue(doc: VenueDoc | null | undefined): VenueSummary | null {
  const resort = mapExperienceResorts(doc?.resort ? [doc.resort] : [])[0]
  if (!doc || !resort) return null
  return {
    id: doc._id,
    name: doc.name,
    capacity: typeof doc.capacity === "number" && doc.capacity > 0 ? doc.capacity : null,
    setups: (doc.setups ?? []).filter((s): s is NonNullable<typeof s> => !!s),
    excerpt: excerpt(doc.excerpt),
    image: toContentImage(doc.image, doc.name),
    resort,
  }
}

type PackageCardDoc = NonNullable<EVENT_PACKAGE_QUERY_RESULT>["related"][number]

/** A package card; null for a package without a known kind. */
export function mapPackage(doc: PackageCardDoc | null | undefined): PackageSummary | null {
  if (!doc?.slug || !isPackageKind(doc.kind)) return null
  return {
    title: doc.title,
    slug: doc.slug,
    kind: doc.kind,
    summary: doc.summary?.trim() ?? "",
    price: mapPrice(doc.fromPrice),
    image: toContentImage(doc.image, doc.title),
    resorts: mapExperienceResorts(doc.resorts),
  }
}

const notNull = <T,>(value: T | null): value is T => value !== null

/** Events page copy; null-safe so a missing singleton still renders. */
export function mapEventsPage(doc: EVENTS_PAGE_QUERY_RESULT, fallbackDescription: string): EventsPage {
  const page = doc.page
  const hero = page?.hero
  const venues = page?.venues
  const enquiry = page?.enquiry
  const title = hero?.title?.trim() || "Celebrations & Events"
  const intro = hero?.intro?.trim() ?? ""

  return {
    hero: {
      eyebrow: hero?.eyebrow?.trim() || "Celebrations & Events",
      title,
      intro,
      image: hero?.image?.asset ? toContentImage(hero.image) : null,
    },
    eventTypes: {
      title: page?.eventTypes?.title?.trim() || "Event Types",
      subtitle: page?.eventTypes?.subtitle?.trim() ?? "",
      tiles: (page?.eventTypes?.tiles ?? []).flatMap((t) =>
        isEventType(t.eventType) && t.image?.asset
          ? [
              {
                key: t._key,
                eventType: t.eventType,
                title: t.title,
                icon: isIconName(t.icon) ? t.icon : null,
                image: toContentImage(t.image, t.title),
              },
            ]
          : []
      ),
    },
    venues: {
      title: venues?.title?.trim() || "Our Venues",
      subtitle: venues?.subtitle?.trim() ?? "",
      text: venues?.text?.trim() ?? "",
      featured: mapVenue(venues?.featured),
      highlights: (venues?.highlights ?? []).flatMap((v) => (v?._id && v.name ? [{ id: v._id, name: v.name }] : [])),
    },
    packages: {
      title: page?.packages?.title?.trim() || "Our Event Packages",
      subtitle: page?.packages?.subtitle?.trim() ?? "",
      cards: (page?.packages?.cards ?? []).flatMap((c) => {
        const pkg = mapPackage(c.package)
        return pkg && isPackageKind(c.kind) && c.image?.asset
          ? [
              {
                key: c._key,
                kind: c.kind,
                title: c.title,
                text: c.text?.trim() ?? "",
                image: toContentImage(c.image, c.title),
                package: pkg,
              },
            ]
          : []
      }),
    },
    enquiry: {
      title: enquiry?.title?.trim() || "Event Enquiry",
      text: enquiry?.text?.trim() ?? "",
      image: enquiry?.image?.asset ? toContentImage(enquiry.image) : null,
    },
    packageOptions: doc.packageOptions.flatMap((p) =>
      p.slug && isPackageKind(p.kind)
        ? [{ title: p.title, slug: p.slug, kind: p.kind, resorts: mapExperienceResorts(p.resorts) }]
        : []
    ),
    venueResorts: mapExperienceResorts(doc.venueResorts),
    seo: mapSeo(page?.seo, { title, description: intro || fallbackDescription }),
  }
}

/** Venues page heading and every venue; null-safe so a missing singleton still renders. */
export function mapVenuesPage(doc: VENUES_PAGE_QUERY_RESULT, fallbackDescription: string): VenuesPage {
  const index = doc.page?.venuesIndex
  const title = index?.title?.trim() || "Event Venues"
  const intro = index?.intro?.trim() ?? ""
  const image = doc.page?.fallbackImage
  return {
    eyebrow: index?.eyebrow?.trim() || "Celebrations & Events",
    title,
    intro,
    venues: doc.venues.map(mapVenue).filter(notNull),
    image: image?.asset ? toContentImage(image) : null,
    seo: mapSeo(doc.page?.venuesSeo, { title, description: intro || fallbackDescription }),
  }
}

type PackagePageDoc = NonNullable<EVENT_PACKAGE_QUERY_RESULT>

/** One package; null when its kind is unknown. */
export function mapEventPackagePage(doc: PackagePageDoc): EventPackagePage | null {
  if (!isPackageKind(doc.kind)) return null
  const summary = doc.summary?.trim() ?? ""
  const images = (doc.images ?? [])
    .filter((img) => img.asset)
    .map((img, i) => toContentImage(img, `${doc.title}, photo ${i + 1}`))
  const fallback = doc.fallbackImage?.asset ? toContentImage(doc.fallbackImage) : toContentImage(null, doc.title)
  const description = (doc.description ?? []) as RichText

  return {
    title: doc.title,
    slug: doc.slug ?? "",
    kind: doc.kind,
    summary,
    price: mapPrice(doc.fromPrice),
    images: images.length > 0 ? images : [fallback],
    description: description.length > 0 ? description : summary ? paragraph(summary, "summary") : [],
    inclusions: (doc.inclusions ?? []).map((i) => i?.trim() ?? "").filter(Boolean),
    resorts: mapOfferResorts(doc.resorts),
    venues: (doc.venues ?? []).flatMap((v) =>
      v?._id && v.name
        ? [
            {
              id: v._id,
              name: v.name,
              capacity: typeof v.capacity === "number" && v.capacity > 0 ? v.capacity : null,
              resort: mapExperienceResorts(v.resort ? [v.resort] : [])[0] ?? null,
            },
          ]
        : []
    ),
    related: (doc.related ?? []).map(mapPackage).filter(notNull),
    seo: mapSeo(doc.seo, { title: doc.title, description: summary }),
  }
}

type PageDoc = NonNullable<PAGE_QUERY_RESULT>
type SectionDoc = NonNullable<PageDoc["sections"]>[number]

/** A labelled link that resolves to a real href, or null. */
function toPageLink(link: (ContentLink & { label?: string | null }) | null | undefined): NavLink | null {
  const label = link?.label?.trim()
  const href = hrefFor(link)
  return label && href !== "#" ? { label, href } : null
}

function hasImage(image: SanityImage | undefined): boolean {
  return Boolean(image?.asset?._id)
}

/** One section block, or null when it lacks what it needs to render. */
function mapPageSection(s: SectionDoc): PageSection | null {
  const key = s._key
  switch (s._type) {
    case "textSection": {
      const body = (s.body ?? []) as RichText
      if (body.length === 0) return null
      return { type: "text", key, eyebrow: s.eyebrow?.trim() ?? "", heading: s.heading?.trim() ?? "", body }
    }
    case "mediaText": {
      const heading = s.heading?.trim() ?? ""
      if (!heading || !hasImage(s.image)) return null
      return {
        type: "mediaText",
        key,
        eyebrow: s.eyebrow?.trim() ?? "",
        heading,
        body: (s.body ?? []) as RichText,
        image: toContentImage(s.image, heading),
        imagePosition: s.imagePosition === "end" ? "end" : "start",
        link: toPageLink(s.link),
      }
    }
    case "featureList": {
      const items = mapIconFeatures((s.items ?? []).filter((i) => i.title?.trim()) as FeatureDoc[])
      if (items.length === 0) return null
      return { type: "features", key, heading: s.heading?.trim() ?? "", intro: s.intro?.trim() ?? "", items }
    }
    case "imageGallery": {
      const heading = s.heading?.trim() ?? ""
      const images = (s.images ?? [])
        .filter(hasImage)
        .map((img, i) => toContentImage(img, heading ? `${heading}, photo ${i + 1}` : ""))
      if (images.length === 0) return null
      return { type: "gallery", key, heading, images }
    }
    case "callToAction": {
      const heading = s.heading?.trim() ?? ""
      const link = toPageLink(s.link)
      if (!heading || !link) return null
      return {
        type: "cta",
        key,
        heading,
        text: s.text?.trim() ?? "",
        link,
        image: hasImage(s.backgroundImage) ? toContentImage(s.backgroundImage) : null,
      }
    }
    case "videoEmbed": {
      const title = s.title?.trim() ?? ""
      const embedUrl = toEmbedUrl(s.url)
      if (!title || !embedUrl || !hasImage(s.poster)) return null
      return { type: "video", key, title, embedUrl, poster: toContentImage(s.poster, title) }
    }
    default:
      return null
  }
}

/** Plain text of the first paragraph-bearing section, for a fallback description. */
function firstSectionText(sections: PageSection[]): string {
  for (const section of sections) {
    if (section.type !== "text" && section.type !== "mediaText") continue
    const text = section.body
      .flatMap((block) => (Array.isArray(block.children) ? block.children : []))
      .map((child: { text?: unknown }) => (typeof child.text === "string" ? child.text : ""))
      .join(" ")
    if (text.trim()) return excerpt(text)
  }
  return ""
}

/** A marketing page; the hero title defaults to the page title. */
export function mapPage(doc: PageDoc): MarketingPage {
  const hero = doc.hero
  const intro = hero?.intro?.trim() ?? ""
  const sections = (doc.sections ?? []).map(mapPageSection).filter(notNull)
  return {
    title: doc.title,
    slug: doc.slug,
    hero: {
      eyebrow: hero?.eyebrow?.trim() ?? "",
      title: hero?.title?.trim() || doc.title,
      intro,
      image: hasImage(hero?.image) ? toContentImage(hero?.image, doc.title) : null,
    },
    sections,
    seo: mapSeo(doc.seo, { title: doc.title, description: excerpt(intro) || firstSectionText(sections) }),
  }
}
