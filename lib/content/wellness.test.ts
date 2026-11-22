import { describe, expect, it } from "vitest"

import type { SpaCategory, TreatmentSummary } from "./types"
import {
  TREATMENT_GROUPS,
  excerpt,
  filterTreatments,
  formatTreatmentPrice,
  groupOf,
  groupsIn,
  parseTreatmentFilters,
  treatmentFiltersQuery,
  treatmentGroupHref,
  treatmentOptions,
  treatmentRequestHref,
  treatmentResorts,
} from "./wellness"

const boston = { name: "Boston Day Spa", heading: "Boston Day Spa", slug: "boston" }
const tana = { name: "Lake Tana", heading: "Kuriftu Resort & Spa Lake Tana", slug: "laketana" }

function treatment(slug: string, category: SpaCategory, resorts = [boston]): TreatmentSummary {
  return {
    title: slug.replace(/-/g, " "),
    slug,
    category,
    excerpt: "",
    duration: "",
    price: null,
    image: { alt: slug },
    resorts,
  }
}

const treatments = [
  treatment("massage-cave", "massage"),
  treatment("steam-sauna-jacuzzi", "hammam"),
  treatment("wax", "body"),
  treatment("mani-pedi", "handsFeet"),
  treatment("nourish-your-soul", "package", [tana]),
]

const params = (query: string) => new URLSearchParams(query)

describe("treatment groups", () => {
  it("maps every spa category to exactly one group", () => {
    const categories: SpaCategory[] = ["massage", "facial", "body", "hammam", "handsFeet", "hair", "package"]
    for (const c of categories) {
      expect(TREATMENT_GROUPS.filter((g) => g.categories.includes(c))).toHaveLength(1)
    }
    expect(groupOf("hammam")).toBe("body")
    expect(groupOf("hair")).toBe("beauty")
    expect(groupOf("package")).toBe("packages")
  })

  it("lists only groups with treatments, in card order", () => {
    expect(groupsIn(treatments).map((g) => g.value)).toEqual(["massage", "body", "packages", "beauty"])
  })
})

describe("parseTreatmentFilters", () => {
  const slugs = ["boston", "laketana"]

  it("keeps known values", () => {
    expect(parseTreatmentFilters(params("category=body&resort=boston"), slugs)).toEqual({ group: "body", resort: "boston" })
  })

  it("ignores unknown values", () => {
    expect(parseTreatmentFilters(params("category=hammam&resort=nowhere"), slugs)).toEqual({ group: null, resort: null })
  })
})

describe("filterTreatments", () => {
  it("filters by group, including every category in it", () => {
    expect(filterTreatments(treatments, { group: "body", resort: null }).map((t) => t.slug)).toEqual([
      "steam-sauna-jacuzzi",
      "wax",
    ])
  })

  it("filters by resort, and both together", () => {
    expect(filterTreatments(treatments, { group: null, resort: "laketana" }).map((t) => t.slug)).toEqual([
      "nourish-your-soul",
    ])
    expect(filterTreatments(treatments, { group: "massage", resort: "laketana" })).toEqual([])
  })

  it("returns everything without filters", () => {
    expect(filterTreatments(treatments, { group: null, resort: null })).toHaveLength(treatments.length)
  })
})

describe("links", () => {
  it("builds filter queries resort first", () => {
    expect(treatmentFiltersQuery({ group: "beauty", resort: "boston" })).toBe("?resort=boston&category=beauty")
    expect(treatmentFiltersQuery({ group: null, resort: null })).toBe("")
  })

  it("links cards and treatments", () => {
    expect(treatmentGroupHref("massage")).toBe("/wellness/treatments?category=massage")
    expect(treatmentRequestHref("massage-cave")).toBe("/wellness?treatment=massage-cave#spa-booking")
  })
})

describe("treatmentResorts and treatmentOptions", () => {
  it("lists resorts once, by heading", () => {
    expect(treatmentResorts(treatments).map((r) => r.slug)).toEqual(["boston", "laketana"])
  })

  it("groups form options by resort, treatments by title", () => {
    const options = treatmentOptions(treatments)
    expect(options.map((o) => o.resort.slug)).toEqual(["boston", "laketana"])
    expect(options[0].treatments.map((t) => t.slug)).toEqual([
      "mani-pedi",
      "massage-cave",
      "steam-sauna-jacuzzi",
      "wax",
    ])
  })
})

describe("formatTreatmentPrice", () => {
  it("shows only an editor's price", () => {
    expect(formatTreatmentPrice(null)).toBeNull()
    expect(formatTreatmentPrice({ amount: 2500, currency: "ETB", unit: "per person" })).toBe("From ETB 2,500 per person")
    expect(formatTreatmentPrice({ amount: 40, currency: "USD", unit: "" })).toBe("From USD 40")
  })
})

describe("excerpt", () => {
  it("keeps short text and collapses whitespace", () => {
    expect(excerpt("  A  calm\n\nretreat. ")).toBe("A calm retreat.")
    expect(excerpt(null)).toBe("")
  })

  it("cuts long text at a word boundary with an ellipsis", () => {
    const text = "Surrender to the stillness, allowing nature's embrace to restore and nourish both body and spirit."
    const short = excerpt(text, 40)
    expect(short.length).toBeLessThanOrEqual(41)
    expect(short.endsWith("…")).toBe(true)
    expect(short).toBe("Surrender to the stillness, allowing…")
  })
})
