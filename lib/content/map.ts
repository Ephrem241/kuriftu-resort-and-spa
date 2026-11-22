import type {
  HOME_PAGE_QUERY_RESULT,
  RESORT_PAGE_QUERY_RESULT,
  ROOM_PAGE_QUERY_RESULT,
  SITEMAP_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity.types"
import { urlFor } from "@/sanity/lib/image"

import { isIconName } from "./icons"
import { hrefFor, pathForDocument, type ContentLink } from "./routes"
import type {
  Amenity,
  ContentImage,
  HomePage,
  NavLink,
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
type ResortCard = NonNullable<NonNullable<HomeDoc["destinations"]>["resorts"]>[number]
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
  return entries
}
