import { describe, expect, it } from "vitest"

import { diningQuery, diningResortsIn, filterVenues, parseDiningResort, reservationContact } from "./dining"
import { mapDiningVenue } from "./map"
import type { DiningResort } from "./types"

const bishoftu: DiningResort = {
  name: "Bishoftu",
  slug: "bishoftu",
  phone: { display: "+251 111 111 111", tel: "+251111111111" },
  email: "bishoftu@example.com",
}
const entoto: DiningResort = { name: "Entoto", slug: "entoto", phone: null, email: null }
const arba: DiningResort = { name: "Arba Minch", slug: "arba-minch", phone: { display: "+251 2", tel: "+2512" }, email: null }

const venues = [
  { id: "a", resort: bishoftu },
  { id: "b", resort: entoto },
  { id: "c", resort: bishoftu },
  { id: "d", resort: arba },
]

const settings = {
  reservationPhone: { display: "+251 999", tel: "+251999" },
  reservationEmail: "reservations@example.com",
}

describe("parseDiningResort", () => {
  const slugs = ["bishoftu", "entoto"]
  it("keeps a known resort", () => {
    expect(parseDiningResort(new URLSearchParams("resort=entoto"), slugs)).toBe("entoto")
  })
  it("treats a missing or unknown resort as all", () => {
    expect(parseDiningResort(new URLSearchParams(""), slugs)).toBeNull()
    expect(parseDiningResort(new URLSearchParams("resort=lake-tana"), slugs)).toBeNull()
    expect(parseDiningResort(new URLSearchParams("resort=%3Cscript%3E"), slugs)).toBeNull()
  })
})

describe("diningQuery", () => {
  it("is empty without a resort and encodes one", () => {
    expect(diningQuery(null)).toBe("")
    expect(diningQuery("arba-minch")).toBe("?resort=arba-minch")
  })
})

describe("filterVenues", () => {
  it("returns every venue unfiltered and only that resort's when filtered", () => {
    expect(filterVenues(venues, null)).toHaveLength(4)
    expect(filterVenues(venues, "bishoftu").map((v) => v.id)).toEqual(["a", "c"])
  })
})

describe("diningResortsIn", () => {
  it("lists each resort once, by name", () => {
    expect(diningResortsIn(venues).map((r) => r.slug)).toEqual(["arba-minch", "bishoftu", "entoto"])
  })
})

describe("reservationContact", () => {
  it("uses the site reservations when unfiltered", () => {
    expect(reservationContact(null, settings)).toEqual({ ...pick(settings), resortName: null })
  })
  it("uses the resort's desk when it has a phone", () => {
    expect(reservationContact(bishoftu, settings)).toEqual({
      phone: bishoftu.phone,
      email: "bishoftu@example.com",
      resortName: "Bishoftu",
    })
  })
  it("falls back to the site email when the resort has none", () => {
    expect(reservationContact(arba, settings).email).toBe("reservations@example.com")
  })
  it("falls back to the site reservations when the resort has no phone", () => {
    expect(reservationContact(entoto, settings)).toEqual({ ...pick(settings), resortName: null })
  })
  it("returns nothing when no contact exists anywhere", () => {
    expect(reservationContact(null, { reservationPhone: null, reservationEmail: null })).toEqual({
      phone: null,
      email: null,
      resortName: null,
    })
  })
})

describe("mapDiningVenue", () => {
  const doc = {
    _id: "diningVenue.bishoftu.lakefront",
    name: "Lakefront Restaurant",
    cuisine: null,
    hours: " Daily 07:00–22:00 ",
    image: { alt: null, crop: null, hotspot: null, asset: { _id: "image-abc-10x10-jpg", url: null, metadata: null } },
    menu: { label: null, url: "https://cdn.sanity.io/files/p/d/abc.pdf" },
    resort: { name: "Bishoftu", slug: "bishoftu", phone: null, email: null },
  }

  it("maps a venue with its Sanity menu and a fallback alt", () => {
    const venue = mapDiningVenue(doc as never)
    expect(venue?.menu).toEqual({ url: "https://cdn.sanity.io/files/p/d/abc.pdf", label: "Menu" })
    expect(venue?.hours).toBe("Daily 07:00–22:00")
    expect(venue?.image.alt).toBe("Lakefront Restaurant at Bishoftu")
  })

  it("drops a menu that is not on Sanity's file CDN", () => {
    const venue = mapDiningVenue({ ...doc, menu: { label: "Menu", url: "https://evil.example.com/menu.pdf" } } as never)
    expect(venue?.menu).toBeNull()
  })

  it("drops a venue without a photo", () => {
    expect(mapDiningVenue({ ...doc, image: null } as never)).toBeNull()
  })
})

function pick(s: typeof settings) {
  return { phone: s.reservationPhone, email: s.reservationEmail }
}
