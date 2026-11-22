import { describe, expect, it } from "vitest"

import { mapHomePage, mapSiteSettings, toContentImage } from "./map"

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
