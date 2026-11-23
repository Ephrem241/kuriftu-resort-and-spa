import { describe, expect, it } from "vitest"

import { mapSitemap } from "@/lib/content/map"
import type { ResortPage, SiteSettings } from "@/lib/content/types"

import { organizationJsonLd, resortJsonLd, serializeJsonLd } from "./json-ld"
import { pageMetadata } from "./metadata"
import { robotsRules } from "./robots"
import { absoluteUrl, siteUrl } from "./site-url"

const ORIGIN = "https://www.example.com"
const sanityImage = (alt: string) => ({
  src: "https://cdn.sanity.io/images/test/test/abc-2000x1000.jpg?w=2560&fit=max&auto=format",
  alt,
})

describe("siteUrl", () => {
  it("returns the origin without a trailing slash or path", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.example.com/" })).toBe(ORIGIN)
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: " https://www.example.com/x " })).toBe(ORIGIN)
  })

  it("falls back to localhost in development only", () => {
    expect(siteUrl({ NODE_ENV: "development" })).toBe("http://localhost:3000")
    expect(() => siteUrl({ NODE_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL/)
  })

  it("rejects non-http schemes", () => {
    expect(() => siteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toThrow()
  })

  it("builds absolute URLs", () => {
    expect(absoluteUrl("/resorts/bishoftu", { NEXT_PUBLIC_SITE_URL: ORIGIN })).toBe(`${ORIGIN}/resorts/bishoftu`)
  })
})

describe("pageMetadata", () => {
  const base = { title: "Bishoftu", description: "Lakeside.", path: "/resorts/bishoftu", siteName: "Kuriftu" }

  it("sets canonical, full Open Graph and Twitter tags", () => {
    const m = pageMetadata({ ...base, image: sanityImage("Pool"), titleAbsolute: true })
    expect(m.title).toEqual({ absolute: "Bishoftu" })
    expect(m.alternates).toEqual({ canonical: "/resorts/bishoftu" })
    expect(m.openGraph).toMatchObject({ type: "website", locale: "en_US", siteName: "Kuriftu", url: "/resorts/bishoftu" })
    const [og] = (m.openGraph as { images: { url: string; width: number; alt: string }[] }).images
    expect(og).toMatchObject({ width: 1200, height: 630, alt: "Pool" })
    expect(og.url).toContain("h=630")
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: [og.url] })
    expect(m.robots).toBeUndefined()
  })

  it("omits empty descriptions and images, and honours noIndex", () => {
    const m = pageMetadata({ ...base, description: "", image: { alt: "No asset" }, noIndex: true })
    expect(m.title).toBe("Bishoftu")
    expect(m.description).toBeUndefined()
    expect((m.openGraph as { images?: unknown }).images).toBeUndefined()
    expect(m.robots).toEqual({ index: false, follow: true })
  })
})

describe("robotsRules", () => {
  it("allows the site, hides internal paths and points at the sitemap", () => {
    expect(robotsRules({ NEXT_PUBLIC_SITE_URL: ORIGIN })).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/design-system"] },
      sitemap: `${ORIGIN}/sitemap.xml`,
    })
  })

  it("closes Vercel previews to all crawlers", () => {
    expect(robotsRules({ NEXT_PUBLIC_SITE_URL: ORIGIN, VERCEL_ENV: "preview" })).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    })
  })
})

describe("mapSitemap", () => {
  it("lists home, resorts, rooms, experiences and marketing pages by path, and skips a noindexed home", () => {
    const rows = {
      home: { _updatedAt: "2026-11-01T00:00:00Z", noIndex: false },
      resorts: [{ slug: "bishoftu", _updatedAt: "2026-11-02T00:00:00Z" }],
      rooms: [{ slug: "lake-side", resortSlug: "bishoftu", _updatedAt: "2026-11-03T00:00:00Z" }],
      experiences: [{ slug: "zipline", _updatedAt: "2026-11-04T00:00:00Z" }],
      wellness: { _updatedAt: "2026-11-05T00:00:00Z", noIndex: false, treatmentsNoIndex: false },
      dining: { _updatedAt: "2026-11-05T12:00:00Z", noIndex: false },
      events: { _updatedAt: "2026-11-06T00:00:00Z", noIndex: false, venuesNoIndex: false },
      eventPackages: [{ slug: "weddings-bishoftu", _updatedAt: "2026-11-07T00:00:00Z" }],
      pages: [{ slug: "about", _updatedAt: "2026-11-08T00:00:00Z" }],
      contact: { _updatedAt: "2026-11-09T00:00:00Z", noIndex: false },
      gallery: { _updatedAt: "2026-11-10T00:00:00Z", noIndex: false },
    }
    expect(mapSitemap(rows as Parameters<typeof mapSitemap>[0])).toEqual([
      { path: "/", lastModified: "2026-11-01T00:00:00Z" },
      { path: "/resorts/bishoftu", lastModified: "2026-11-02T00:00:00Z" },
      { path: "/resorts/bishoftu/rooms/lake-side", lastModified: "2026-11-03T00:00:00Z" },
      { path: "/experience/zipline", lastModified: "2026-11-04T00:00:00Z" },
      { path: "/wellness", lastModified: "2026-11-05T00:00:00Z" },
      { path: "/wellness/treatments", lastModified: "2026-11-05T00:00:00Z" },
      { path: "/dining", lastModified: "2026-11-05T12:00:00Z" },
      { path: "/event", lastModified: "2026-11-06T00:00:00Z" },
      { path: "/event/venues", lastModified: "2026-11-06T00:00:00Z" },
      { path: "/event/weddings-bishoftu", lastModified: "2026-11-07T00:00:00Z" },
      { path: "/about", lastModified: "2026-11-08T00:00:00Z" },
      { path: "/contact", lastModified: "2026-11-09T00:00:00Z" },
      { path: "/gallery", lastModified: "2026-11-10T00:00:00Z" },
    ])
    const hidden = {
      ...rows,
      home: { ...rows.home, noIndex: true },
      resorts: [],
      rooms: [],
      experiences: [],
      wellness: { ...rows.wellness, noIndex: true, treatmentsNoIndex: true },
      dining: { ...rows.dining, noIndex: true },
      events: { ...rows.events, noIndex: true, venuesNoIndex: true },
      eventPackages: [],
      pages: [],
      contact: { ...rows.contact, noIndex: true },
      gallery: { ...rows.gallery, noIndex: true },
    }
    expect(mapSitemap(hidden as Parameters<typeof mapSitemap>[0])).toEqual([])
    expect(mapSitemap({ ...hidden, wellness: null, events: null } as Parameters<typeof mapSitemap>[0])).toEqual([])
    // Unpublished dining, contact and gallery pages still render (with fallbacks), so they stay listed.
    expect(mapSitemap({ ...hidden, dining: null, contact: null, gallery: null } as Parameters<typeof mapSitemap>[0])).toEqual([
      { path: "/dining", lastModified: undefined },
      { path: "/contact", lastModified: undefined },
      { path: "/gallery", lastModified: undefined },
    ])
  })
})

describe("organizationJsonLd", () => {
  const settings = {
    brandName: "Kuriftu Resorts & Spa",
    reservationPhone: { display: "+251 999 222 211", tel: "+251999222211" },
    reservationEmail: "booking@example.com",
    headOfficeAddress: { street: "", locality: "Addis Ababa", region: "", postalCode: "", country: "Ethiopia" },
    logo: null,
    social: [{ platform: "instagram", url: "https://www.instagram.com/kuriftu" }],
  } as unknown as SiteSettings

  it("describes the brand without empty values", () => {
    expect(organizationJsonLd(settings, ORIGIN)).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${ORIGIN}/#organization`,
      name: "Kuriftu Resorts & Spa",
      url: `${ORIGIN}/`,
      sameAs: ["https://www.instagram.com/kuriftu"],
      contactPoint: { "@type": "ContactPoint", contactType: "reservations", telephone: "+251999222211", email: "booking@example.com" },
      address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "Ethiopia" },
    })
  })
})

describe("resortJsonLd", () => {
  const resort = {
    heading: "Kuriftu Resort & Spa Bishoftu",
    type: "resortAndSpa",
    seo: { title: "Bishoftu", description: "Lakeside.", image: null, noIndex: false },
    heroImage: sanityImage("Pool"),
    address: { street: "", locality: "Bishoftu", region: "Oromia", postalCode: "", country: "Ethiopia" },
    geo: { lat: 8.78, lng: 39.0 },
    phone: { display: "+251 924 949 494", tel: "+251924949494" },
    email: null,
    amenities: [{ key: "a", icon: "wifi", label: "Free Wi-Fi" }],
  } as unknown as ResortPage
  const url = `${ORIGIN}/resorts/bishoftu`

  it("builds a Resort with address, geo, contact and amenities", () => {
    const ld = resortJsonLd(resort, url, ORIGIN)
    expect(ld).toMatchObject({
      "@type": "Resort",
      "@id": `${url}#resort`,
      name: "Kuriftu Resort & Spa Bishoftu",
      url,
      description: "Lakeside.",
      address: { "@type": "PostalAddress", addressLocality: "Bishoftu", addressRegion: "Oromia", addressCountry: "Ethiopia" },
      geo: { "@type": "GeoCoordinates", latitude: 8.78, longitude: 39.0 },
      telephone: "+251924949494",
      amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Free Wi-Fi", value: true }],
      parentOrganization: { "@id": `${ORIGIN}/#organization` },
    })
    expect(ld.image).toContain("w=1200")
    expect(ld).not.toHaveProperty("email")
    expect(ld).not.toHaveProperty("starRating")
    expect(ld).not.toHaveProperty("priceRange")
  })

  it("maps day spas and parks to their schema.org types, without amenities", () => {
    expect(resortJsonLd({ ...resort, type: "daySpa" }, url, ORIGIN)).toMatchObject({ "@type": "DaySpa" })
    const park = resortJsonLd({ ...resort, type: "waterPark", address: null, geo: null }, url, ORIGIN)
    expect(park["@type"]).toBe("AmusementPark")
    expect(park).not.toHaveProperty("amenityFeature")
    expect(park).not.toHaveProperty("address")
    expect(park).not.toHaveProperty("geo")
  })
})

describe("serializeJsonLd", () => {
  it("escapes < so content cannot close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" })
    expect(out).not.toContain("<")
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>")
  })
})
