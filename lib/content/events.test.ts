import { describe, expect, it } from "vitest"

import { EVENT_TYPES } from "@/lib/enquiry/schema"

import {
  EVENT_TYPE_OPTIONS,
  enquiryTypeFor,
  eventEnquiryHref,
  filterVenues,
  formatCapacity,
  formatPackagePrice,
  packagePriceParts,
  parseEnquiryPreset,
  parseVenueResort,
  venueResorts,
  venuesHref,
} from "./events"
import type { ExperienceResort, PackageOption } from "./types"

const bishoftu: ExperienceResort = { name: "Bishoftu", heading: "Kuriftu Resort & Spa Bishoftu", slug: "bishoftu" }
const entoto: ExperienceResort = { name: "Entoto", heading: "Kuriftu Entoto Adventure Park", slug: "entoto" }
const village: ExperienceResort = { name: "African Village", heading: "Kuriftu African Village", slug: "african-village" }

const packages: PackageOption[] = [
  { title: "Weddings", slug: "weddings-bishoftu", kind: "wedding", resorts: [bishoftu] },
  { title: "Corporate Retreat", slug: "corporate-retreat-entoto", kind: "meeting", resorts: [entoto, bishoftu] },
  { title: "Birthday", slug: "birthday-village", kind: "celebration", resorts: [village] },
]
const resorts = [bishoftu, entoto]
const params = (query: string) => new URLSearchParams(query)

describe("event types", () => {
  it("lists every type the server accepts, once", () => {
    expect(EVENT_TYPE_OPTIONS.map((o) => o.value).sort()).toEqual([...EVENT_TYPES].sort())
  })

  it("stores corporate events and conferences as meetings", () => {
    expect(enquiryTypeFor("conference")).toBe("meeting")
    expect(enquiryTypeFor("corporate")).toBe("meeting")
    expect(enquiryTypeFor("wedding")).toBe("event")
    expect(enquiryTypeFor("")).toBe("event")
  })
})

describe("eventEnquiryHref", () => {
  it("links to the form with presets", () => {
    expect(eventEnquiryHref()).toBe("/event#event-enquiry")
    expect(eventEnquiryHref({ type: "wedding" })).toBe("/event?type=wedding#event-enquiry")
    expect(eventEnquiryHref({ package: "weddings-bishoftu", resort: "bishoftu" })).toBe(
      "/event?package=weddings-bishoftu&resort=bishoftu#event-enquiry"
    )
  })
})

describe("parseEnquiryPreset", () => {
  it("keeps known values only", () => {
    expect(parseEnquiryPreset(params("type=wedding&resort=entoto"), packages, resorts)).toEqual({
      eventType: "wedding",
      package: null,
      resort: entoto,
    })
    expect(parseEnquiryPreset(params("type=funeral&resort=mars&package=nope"), packages, resorts)).toEqual({
      eventType: "",
      package: null,
      resort: null,
    })
  })

  it("takes the event type and resort from a package", () => {
    expect(parseEnquiryPreset(params("package=birthday-village"), packages, resorts)).toEqual({
      eventType: "social",
      package: packages[2],
      resort: village,
    })
  })

  it("keeps a requested type of the same enquiry type, and a resort that offers the package", () => {
    const preset = parseEnquiryPreset(params("package=corporate-retreat-entoto&type=conference&resort=bishoftu"), packages, resorts)
    expect(preset.eventType).toBe("conference")
    expect(preset.resort).toEqual(bishoftu)
  })

  it("overrides a conflicting type and a resort that doesn't offer the package", () => {
    const preset = parseEnquiryPreset(params("package=weddings-bishoftu&type=conference&resort=entoto"), packages, resorts)
    expect(preset.eventType).toBe("wedding")
    expect(preset.resort).toEqual(bishoftu)
  })
})

describe("venues", () => {
  const venues = [
    { name: "Lake Side", resort: bishoftu },
    { name: "Open Air Spaces", resort: entoto },
    { name: "Girum Hall", resort: bishoftu },
  ]

  it("filters by a known resort only", () => {
    expect(parseVenueResort(params("resort=entoto"), ["bishoftu", "entoto"])).toBe("entoto")
    expect(parseVenueResort(params("resort=<x>"), ["bishoftu", "entoto"])).toBeNull()
    expect(filterVenues(venues, "bishoftu").map((v) => v.name)).toEqual(["Lake Side", "Girum Hall"])
    expect(filterVenues(venues, null)).toHaveLength(3)
  })

  it("lists each resort once, by heading", () => {
    // "Kuriftu Entoto…" sorts before "Kuriftu Resort & Spa…"
    expect(venueResorts(venues)).toEqual([entoto, bishoftu])
  })

  it("builds the venues link", () => {
    expect(venuesHref()).toBe("/event/venues")
    expect(venuesHref("bishoftu")).toBe("/event/venues?resort=bishoftu")
  })
})

describe("formatting", () => {
  it("shows capacity only when entered", () => {
    expect(formatCapacity(500)).toBe("Up to 500 Guests")
    expect(formatCapacity(1200)).toBe("Up to 1,200 Guests")
    expect(formatCapacity(null)).toBeNull()
    expect(formatCapacity(0)).toBeNull()
  })

  it("shows a price only when entered", () => {
    expect(formatPackagePrice({ amount: 45000, currency: "ETB", unit: "for 10 guests" })).toBe("ETB 45,000 for 10 guests")
    expect(formatPackagePrice({ amount: 1200, currency: "USD", unit: "" })).toBe("USD 1,200")
    expect(formatPackagePrice(null)).toBeNull()
    expect(packagePriceParts({ amount: 45000, currency: "ETB", unit: "for 10 guests" })).toEqual({
      amount: "ETB 45,000",
      unit: "for 10 guests",
    })
    expect(packagePriceParts({ amount: 0, currency: "ETB", unit: "" })).toBeNull()
  })
})
