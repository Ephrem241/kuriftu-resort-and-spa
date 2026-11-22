import { ogImage } from "@/lib/content/og"
import type { PostalAddress, ResortPage, ResortType, SiteSettings } from "@/lib/content/types"

/**
 * schema.org JSON-LD built from content. Empty fields are left out; nothing
 * (ratings, prices, stars) is added that an editor hasn't entered.
 */

type JsonLd = Record<string, unknown>

/** Drops undefined, null, "" and [] so the output never carries empty values. */
function compact<T extends JsonLd>(obj: T): JsonLd {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
    )
  )
}

export function organizationId(origin: string) {
  return `${origin}/#organization`
}

function postalAddress(address: PostalAddress | null): JsonLd | undefined {
  if (!address) return undefined
  return compact({
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.locality,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressCountry: address.country,
  })
}

/** The brand, once per page from the root layout. */
export function organizationJsonLd(settings: SiteSettings, origin: string): JsonLd {
  const phone = settings.reservationPhone?.tel
  const email = settings.reservationEmail
  const contactPoint =
    phone || email
      ? compact({ "@type": "ContactPoint", contactType: "reservations", telephone: phone, email })
      : undefined

  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(origin),
    name: settings.brandName,
    url: `${origin}/`,
    logo: settings.logo?.src,
    sameAs: settings.social.map((s) => s.url),
    contactPoint,
    address: postalAddress(settings.headOfficeAddress),
  })
}

/** schema.org type per resort type (schema.org has no water-park type). */
const RESORT_SCHEMA_TYPE: Record<ResortType, string> = {
  resortAndSpa: "Resort",
  adventurePark: "AmusementPark",
  waterPark: "AmusementPark",
  daySpa: "DaySpa",
}

/** One resort, park or day spa, on its own page. */
export function resortJsonLd(resort: ResortPage, canonicalUrl: string, origin: string): JsonLd {
  const type = RESORT_SCHEMA_TYPE[resort.type] ?? "LodgingBusiness"
  const image = resort.seo.image ?? resort.heroImage
  const amenities =
    type === "Resort"
      ? resort.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.label, value: true }))
      : []

  return compact({
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${canonicalUrl}#resort`,
    name: resort.heading,
    url: canonicalUrl,
    description: resort.seo.description,
    image: image.src ? ogImage(image)?.[0]?.url : undefined,
    address: postalAddress(resort.address),
    geo: resort.geo
      ? { "@type": "GeoCoordinates", latitude: resort.geo.lat, longitude: resort.geo.lng }
      : undefined,
    telephone: resort.phone?.tel,
    email: resort.email,
    amenityFeature: amenities,
    parentOrganization: { "@id": organizationId(origin) },
  })
}

/** Serialises JSON-LD for a script tag; "<" is escaped so content can't close it. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
