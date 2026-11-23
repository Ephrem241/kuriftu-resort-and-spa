import { describe, expect, it } from "vitest"

import { addressLines, hasChannels } from "./contact"
import { mapContactPage } from "./map"

const address = { street: "", locality: "Bishoftu", region: "Oromia", postalCode: "", country: "Ethiopia" }

describe("addressLines", () => {
  it("joins town, region and postcode and skips empty parts", () => {
    expect(addressLines(address)).toEqual(["Bishoftu, Oromia", "Ethiopia"])
    expect(addressLines({ ...address, street: "Lake Babogaya", postalCode: "1000" })).toEqual([
      "Lake Babogaya",
      "Bishoftu, Oromia 1000",
      "Ethiopia",
    ])
  })

  it("returns nothing without an address", () => {
    expect(addressLines(null)).toEqual([])
  })
})

describe("hasChannels", () => {
  it("needs a phone or an email", () => {
    expect(hasChannels({ phones: [], emails: [] })).toBe(false)
    expect(hasChannels({ phones: [], emails: [{ label: "", address: "a@b.co" }] })).toBe(true)
    expect(hasChannels({ phones: [{ label: "", display: "+251 1", tel: "+2511" }], emails: [] })).toBe(true)
  })
})


describe("mapContactPage", () => {
  const phone = { label: "Reservations", display: "+251 999 222 211", tel: "+251999222211" }

  it("falls back when unpublished and keeps only complete phones and emails", () => {
    const page = mapContactPage(
      {
        page: null,
        settings: {
          reservations: { phones: [phone, { label: null, display: "", tel: "+2511" }], emails: [{ label: null, address: "booking@example.com" }] },
          headOffice: null,
          headOfficeAddress: { streetAddress: null, locality: "Addis Ababa", region: null, postalCode: null, country: "Ethiopia" },
        },
        resorts: [
          {
            name: "Bishoftu",
            fullName: "Kuriftu Resort & Spa Bishoftu",
            slug: "bishoftu",
            locationLabel: "Bishoftu",
            address: null,
            reservationContact: { phones: [phone], emails: null },
          },
        ],
      } as unknown as Parameters<typeof mapContactPage>[0],
      "Fallback description"
    )

    expect(page.hero).toMatchObject({ eyebrow: "Contact Us", title: "Contact Us", image: null })
    expect(page.form.title).toBe("Send Us a Message")
    expect(page.directoryTitle).toBe("Our Resorts")
    expect(page.seo.description).toBe("Fallback description")
    expect(page.reservations).toEqual({ phones: [phone], emails: [{ label: "", address: "booking@example.com" }] })
    expect(page.headOffice).toMatchObject({ phones: [], emails: [], address: { locality: "Addis Ababa" } })
    expect(page.resorts[0]).toMatchObject({ heading: "Kuriftu Resort & Spa Bishoftu", phones: [phone], emails: [] })
  })
})
