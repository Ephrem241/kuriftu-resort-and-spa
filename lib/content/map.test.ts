import { describe, expect, it } from "vitest"

import { mapHomePage, mapResortPage, mapRoomPage, mapSiteSettings, toContentImage } from "./map"

const asset = {
  _id: "image-abc123-2000x1000-jpg",
  url: "https://cdn.sanity.io/images/test/test/abc123-2000x1000.jpg",
  metadata: { lqip: "data:image/jpeg;base64,xyz" },
}

describe("toContentImage", () => {
  it("returns a placeholder (alt only) when there is no asset", () => {
    expect(toContentImage(null, "Fallback")).toEqual({ alt: "Fallback" })
    expect(toContentImage({ alt: "Lake" })).toEqual({ alt: "Lake" })
  })

  it("builds a cropped, auto-format CDN URL with LQIP and hotspot position", () => {
    const img = toContentImage({
      alt: "Lake at dusk",
      asset,
      crop: { top: 0.1, bottom: 0.1, left: 0, right: 0 },
      hotspot: { x: 0.8, y: 0.25 },
    })
    expect(img.alt).toBe("Lake at dusk")
    expect(img.src).toMatch(/^https:\/\/cdn\.sanity\.io\/images\//)
    expect(img.src).toContain("rect=0,100,2000,800")
    expect(img.src).toContain("auto=format")
    expect(img.lqip).toBe(asset.metadata.lqip)
    expect(img.objectPosition).toBe("80% 25%")
  })
})

describe("mapSiteSettings", () => {
  const base = {
    brandName: "Kuriftu",
    footerTagline: null,
    storyVideoUrl: null,
    reservationPhone: null,
    reservationEmail: null,
    headOfficeAddress: null,
    social: null,
    navResorts: null,
    experienceLinks: null,
    footerColumns: null,
    legalLinks: null,
    bookableResorts: [],
  }

  it("defaults missing content to empty values, not invented ones", () => {
    const s = mapSiteSettings(base, 2026)
    expect(s.reservationPhone).toBeNull()
    expect(s.reservationEmail).toBeNull()
    expect(s.address).toBeNull()
    expect(s.footerColumns).toEqual([])
    expect(s.copyrightYear).toBe(2026)
  })

  it("maps contact, address and links", () => {
    const s = mapSiteSettings(
      {
        ...base,
        reservationPhone: { display: "+251 999 222 211", tel: "+251999222211" },
        reservationEmail: "booking@example.com",
        headOfficeAddress: { locality: "Addis Ababa", country: "Ethiopia" },
        legalLinks: [{ label: "Privacy", linkType: "path", path: "/privacy-policy", url: null, target: null }],
      },
      2026
    )
    expect(s.reservationPhone?.tel).toBe("+251999222211")
    expect(s.address).toBe("Addis Ababa, Ethiopia")
    expect(s.legalLinks).toEqual([{ label: "Privacy", href: "/privacy-policy" }])
  })
})

describe("mapHomePage", () => {
  it("drops pillars with unknown icons and rooms whose resort is missing", () => {
    const home = mapHomePage({
      heroSlides: [],
      destinations: null,
      experience: {
        title: "Experience",
        image: null,
        pillars: [
          { icon: "bed", title: "Stay", subtitle: null, link: null },
          { icon: "rocket" as "bed", title: "Bad", subtitle: null, link: null },
        ],
      },
      rooms: {
        title: "Rooms",
        subtitle: null,
        items: [
          { title: "A", slug: "a", resortSlug: null as unknown as string, summary: "s", maxGuests: 2, sizeSqm: null, image: null },
          { title: "B", slug: "b", resortSlug: "bishoftu", summary: "s", maxGuests: 2, sizeSqm: 40, image: null },
        ],
      },
      offersPanel: null,
      testimonials: null,
      stayConnected: null,
    })
    expect(home.heroSlides).toEqual([])
    expect(home.experience.pillars).toEqual([{ icon: "bed", title: "Stay", subtitle: "", href: "#" }])
    expect(home.rooms.items.map((r) => r.slug)).toEqual(["b"])
    expect(home.rooms.items[0].image).toEqual({ alt: "B" })
  })
})

describe("mapResortPage", () => {
  const image = (alt: string) => ({ alt, crop: null, hotspot: null, asset: { ...asset, metadata: { lqip: null, dimensions: null } } })
  const base = {
    _id: "resort.bishoftu",
    name: "Bishoftu",
    fullName: "Kuriftu Resort & Spa Bishoftu",
    slug: "bishoftu",
    type: "resortAndSpa" as const,
    tagline: "Lakeside Retreat",
    summary: null,
    introTitle: null,
    locationLabel: "Bishoftu",
    intro: null,
    amenities: [
      { _key: "a", icon: "wifi" as const, label: "Free Wi-Fi" },
      { _key: "b", icon: null, label: "Pedicure" },
    ],
    country: "Ethiopia",
    geo: { lat: 8.78, lng: 39.0 },
    gettingHere: "53.8 km from Addis Ababa Bole International Airport",
    heroImage: image("Lakeside pool at dusk"),
    heroVideoUrl: null,
    gallery: [image("Gallery one")],
    bookable: true,
    bookingPropertyId: null,
    phone: { display: "+251 924 949 494", tel: "+251924949494" },
    email: "booking@kurifturesorts.com",
    seo: { title: null, description: "Set against the tranquil shores." },
    rooms: [
      { title: "Lake Side", slug: "lake-side", resortSlug: "bishoftu", summary: "Lake views.", maxGuests: null, sizeSqm: null, image: image("Room") },
      { title: "Orphan", slug: "orphan", resortSlug: null, summary: "", maxGuests: null, sizeSqm: null, image: null },
    ],
    experiences: [
      { category: "water" as const, image: image("Kayak") },
      { category: "nature" as const, image: null },
    ],
    spaImage: null,
    diningImage: image("Dinner"),
  }

  it("maps headings, fallbacks and only addressable content", () => {
    const page = mapResortPage(base as unknown as Parameters<typeof mapResortPage>[0])
    expect(page.heading).toBe("Kuriftu Resort & Spa Bishoftu")
    expect(page.introTitle).toBe("Lakeside Retreat")
    expect(page.summary).toBe("")
    expect(page.intro).toEqual([])
    expect(page.amenities).toEqual([
      { key: "a", icon: "wifi", label: "Free Wi-Fi" },
      { key: "b", icon: null, label: "Pedicure" },
    ])
    expect(page.seo).toEqual({ title: "Kuriftu Resort & Spa Bishoftu", description: "Set against the tranquil shores." })
    expect(page.aboutImage.alt).toBe("Gallery one")
    expect(page.ctaImage.alt).toBe("Lakeside pool at dusk")
    expect(page.rooms.map((r) => r.slug)).toEqual(["lake-side"])
    expect(page.experiences).toHaveLength(1)
    expect(page.spaImage).toBeNull()
    expect(page.diningImage?.alt).toBe("Dinner")
    expect(page.geo).toEqual({ lat: 8.78, lng: 39.0 })
  })

  it("falls back to the name and drops incomplete geo", () => {
    const page = mapResortPage({ ...base, fullName: null, geo: { lat: null, lng: 39 }, phone: null } as unknown as Parameters<typeof mapResortPage>[0])
    expect(page.heading).toBe("Bishoftu")
    expect(page.geo).toBeNull()
    expect(page.phone).toBeNull()
  })
})

describe("mapRoomPage", () => {
  const image = (alt: string) => ({ alt, crop: null, hotspot: null, asset: { ...asset, metadata: { lqip: null, dimensions: null } } })
  const base = {
    _id: "room.bishoftu.2",
    title: "Gateway Retreat",
    slug: "gateway-retreat",
    summary: " Awaken to birdsong. ",
    overviewTitle: null,
    description: null,
    videoUrl: null,
    images: [image("Garden room"), { alt: "No asset", crop: null, hotspot: null, asset: null }],
    maxGuests: null,
    bedConfiguration: null,
    sizeSqm: null,
    view: null,
    amenities: [
      { _key: "a", icon: "wifi", label: "Wifi" },
      { _key: "b", icon: "rocket", label: "Slippers" },
    ],
    features: [" Private balcony ", ""],
    fromPrice: null,
    seo: null,
    resort: {
      name: "Bishoftu",
      fullName: "Kuriftu Resort & Spa Bishoftu",
      slug: "bishoftu",
      bookable: true,
      bookingPropertyId: null,
      phone: { display: "+251 11 123 4567", tel: "+251111234567" },
      email: "bishoftu@example.com",
    },
    related: [
      { title: "Lake Side", slug: "lake-side", resortSlug: "bishoftu", summary: "Lakefront.", maxGuests: null, sizeSqm: null, image: image("Lake") },
      { title: "Orphan", slug: "orphan", resortSlug: null, summary: "", maxGuests: null, sizeSqm: null, image: null },
    ],
  } as unknown as Parameters<typeof mapRoomPage>[0]

  it("maps fallbacks without inventing content", () => {
    const room = mapRoomPage(base)!
    expect(room.summary).toBe("Awaken to birdsong.")
    expect(room.overviewTitle).toBe("")
    // Empty description falls back to the summary as one paragraph.
    expect(room.description).toHaveLength(1)
    expect(JSON.stringify(room.description)).toContain("Awaken to birdsong.")
    expect(room.images).toHaveLength(1)
    expect(room.images[0].alt).toBe("Garden room")
    expect(room.amenities).toEqual([
      { key: "a", icon: "wifi", label: "Wifi" },
      { key: "b", icon: null, label: "Slippers" },
    ])
    expect(room.features).toEqual(["Private balcony"])
    expect(room.fromPrice).toBeNull()
    expect(room.maxGuests).toBeNull()
    expect(room.seo).toEqual({ title: "Gateway Retreat | Kuriftu Resort & Spa Bishoftu", description: "Awaken to birdsong." })
    expect(room.resort).toMatchObject({
      heading: "Kuriftu Resort & Spa Bishoftu",
      slug: "bishoftu",
      bookable: true,
      phone: { display: "+251 11 123 4567", tel: "+251111234567" },
      email: "bishoftu@example.com",
    })
    expect(room.related.map((r) => r.slug)).toEqual(["lake-side"])
  })

  it("keeps editor-entered price and facts, and needs a resort", () => {
    const room = mapRoomPage({
      ...base,
      maxGuests: 2,
      sizeSqm: 35,
      view: "Lake View",
      bedConfiguration: "King bed",
      fromPrice: { amount: 120, currency: "USD", unit: null },
    } as typeof base)!
    expect(room.fromPrice).toEqual({ amount: 120, currency: "USD", unit: "" })
    expect(room).toMatchObject({ maxGuests: 2, sizeSqm: 35, view: "Lake View", bedConfiguration: "King bed" })
    expect(mapRoomPage({ ...base, resort: null } as unknown as typeof base)).toBeNull()
  })

  it("shows a placeholder when no image has an asset", () => {
    const room = mapRoomPage({ ...base, images: [] } as unknown as typeof base)!
    expect(room.images).toEqual([{ alt: "Gateway Retreat" }])
  })
})
