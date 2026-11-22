import { describe, expect, it } from "vitest"

import {
  EXPERIENCE_CATEGORIES,
  categoriesIn,
  categoryLabel,
  experienceAction,
  filterExperiences,
  filtersQuery,
  isExperienceCategory,
  parseExperienceFilters,
  resortsIn,
} from "./experiences"
import type { OfferResort } from "./types"

const entoto = { name: "Entoto", heading: "Kuriftu Entoto Adventure Park", slug: "entoto" }
const bishoftu = { name: "Bishoftu", heading: "Kuriftu Resort & Spa Bishoftu", slug: "bishoftu" }
const waterpark = { name: "Water Park", heading: "Kuriftu Water Park", slug: "waterpark" }

const experiences = [
  { slug: "zipline", category: "adventure" as const, resorts: [entoto] },
  { slug: "archery", category: "adventure" as const, resorts: [entoto] },
  { slug: "kayaking", category: "water" as const, resorts: [bishoftu] },
  { slug: "slides", category: "water" as const, resorts: [waterpark, bishoftu] },
]

const params = (query: string) => new URLSearchParams(query)
const slugs = ["entoto", "bishoftu", "waterpark"]

function contact(slug: string, bookable: boolean): OfferResort {
  return { name: slug, heading: slug, slug, bookable, bookingPropertyId: null, phone: null, email: null }
}

describe("isExperienceCategory", () => {
  it("accepts the schema categories only", () => {
    for (const { value } of EXPERIENCE_CATEGORIES) expect(isExperienceCategory(value)).toBe(true)
    expect(isExperienceCategory("spa")).toBe(false)
    expect(isExperienceCategory(null)).toBe(false)
  })

  it("labels a category", () => {
    expect(categoryLabel("water")).toBe("Water")
  })
})

describe("parseExperienceFilters", () => {
  it("reads a known category and resort", () => {
    expect(parseExperienceFilters(params("resort=entoto&category=adventure"), slugs)).toEqual({
      category: "adventure",
      resort: "entoto",
    })
  })

  it("ignores unknown or empty values", () => {
    expect(parseExperienceFilters(params("resort=nowhere&category=<script>"), slugs)).toEqual({
      category: null,
      resort: null,
    })
    expect(parseExperienceFilters(params(""), slugs)).toEqual({ category: null, resort: null })
  })
})

describe("filtersQuery", () => {
  it("puts the resort first, as resort pages link", () => {
    expect(filtersQuery({ category: "water", resort: "bishoftu" })).toBe("?resort=bishoftu&category=water")
  })

  it("is empty with no filters", () => {
    expect(filtersQuery({ category: null, resort: null })).toBe("")
  })

  it("round-trips through parseExperienceFilters", () => {
    const filters = { category: "adventure" as const, resort: "entoto" }
    expect(parseExperienceFilters(params(filtersQuery(filters)), slugs)).toEqual(filters)
  })
})

describe("filterExperiences", () => {
  const slugsOf = (list: { slug: string }[]) => list.map((e) => e.slug)

  it("returns everything with no filters", () => {
    expect(filterExperiences(experiences, { category: null, resort: null })).toHaveLength(4)
  })

  it("filters by category", () => {
    expect(slugsOf(filterExperiences(experiences, { category: "water", resort: null }))).toEqual(["kayaking", "slides"])
  })

  it("filters by any resort the experience is offered at", () => {
    expect(slugsOf(filterExperiences(experiences, { category: null, resort: "bishoftu" }))).toEqual([
      "kayaking",
      "slides",
    ])
  })

  it("combines both filters", () => {
    expect(filterExperiences(experiences, { category: "adventure", resort: "bishoftu" })).toEqual([])
  })
})

describe("categoriesIn and resortsIn", () => {
  it("lists used categories in strip order", () => {
    expect(categoriesIn(experiences).map((c) => c.value)).toEqual(["adventure", "water"])
  })

  it("lists each resort once, sorted by heading", () => {
    expect(resortsIn(experiences).map((r) => r.slug)).toEqual(["entoto", "bishoftu", "waterpark"])
  })
})

describe("experienceAction", () => {
  it("books a bookable resort", () => {
    const resort = contact("entoto", true)
    expect(experienceAction({ action: "book", resorts: [resort] })).toEqual({ kind: "book", resort })
  })

  it("contacts a resort that can't take stays, even when set to book", () => {
    const resort = contact("waterpark", false)
    expect(experienceAction({ action: "book", resorts: [resort] })).toEqual({ kind: "contact", resort })
  })

  it("always contacts for enquire", () => {
    const resort = contact("entoto", true)
    expect(experienceAction({ action: "enquire", resorts: [resort] })).toEqual({ kind: "contact", resort })
  })

  it("contacts site reservations when an enquiry spans several resorts", () => {
    expect(
      experienceAction({ action: "enquire", resorts: [contact("a", true), contact("b", true)] })
    ).toEqual({ kind: "contact", resort: null })
  })

  it("books with no property preselected when several resorts include a bookable one", () => {
    expect(
      experienceAction({ action: "book", resorts: [contact("a", false), contact("b", true)] })
    ).toEqual({ kind: "book", resort: null })
  })
})
