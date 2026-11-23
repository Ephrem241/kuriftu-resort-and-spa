import { describe, expect, it } from "vitest"

import { menuSource } from "./menus"

const NOT_MENUS = ["https://kuriftu-media.s3.us-east-1.amazonaws.com/About/Entoto+Adventure+Park+Activities..pdf"]

describe("menuSource", () => {
  it("resolves a site-relative path against the old site", () => {
    expect(menuSource("/assets/resorts/arba_minch/menus/canopy-menu.pdf", NOT_MENUS)).toEqual({
      url: "https://www.kurifturesorts.com/assets/resorts/arba_minch/menus/canopy-menu.pdf",
      label: "Menu",
    })
  })

  it("labels beverage and à la carte menus from the file name", () => {
    expect(menuSource("https://kuriftu-media.s3.us-east-1.amazonaws.com/About/KRS+Entoto+Beverage+Menu.pdf", [])?.label).toBe(
      "Beverage menu"
    )
    expect(
      menuSource("https://kuriftu-media.s3.us-east-1.amazonaws.com/About/KRS+Lake+Tana+Al+a+Carte+Menu.pdf", [])?.label
    ).toBe("À la carte menu")
  })

  it("skips links listed as not menus", () => {
    expect(menuSource(NOT_MENUS[0], NOT_MENUS)).toBeNull()
  })

  it("rejects other hosts, non-PDFs, http and empty values", () => {
    expect(menuSource("https://evil.example.com/menu.pdf", [])).toBeNull()
    expect(menuSource("https://kuriftu-media.s3.amazonaws.com/files/menu.html", [])).toBeNull()
    expect(menuSource("http://kuriftu-media.s3.amazonaws.com/files/AwashMenu.pdf", [])).toBeNull()
    expect(menuSource("", [])).toBeNull()
    expect(menuSource(undefined, [])).toBeNull()
  })
})
