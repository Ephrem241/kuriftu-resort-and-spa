import { describe, expect, it } from "vitest"

import { groupDestinations } from "./destinations"
import type { ResortType } from "./types"

const r = (name: string, type: ResortType | null) => ({ name, type })

describe("groupDestinations", () => {
  it("splits resorts and spas from adventure and wellness, sorted by name", () => {
    const groups = groupDestinations([
      r("Water Park", "waterPark"),
      r("Lake Tana", "resortAndSpa"),
      r("Boston Day Spa", "daySpa"),
      r("Bishoftu", "resortAndSpa"),
      r("Entoto", "adventurePark"),
    ])
    expect(groups.map((g) => [g.id, g.resorts.map((x) => x.name)])).toEqual([
      ["resorts", ["Bishoftu", "Lake Tana"]],
      ["adventure", ["Boston Day Spa", "Entoto", "Water Park"]],
    ])
  })

  it("leaves out an empty group", () => {
    const groups = groupDestinations([r("Bishoftu", "resortAndSpa")])
    expect(groups.map((g) => g.id)).toEqual(["resorts"])
  })

  it("puts a resort with no type in the first group", () => {
    const groups = groupDestinations([r("New Resort", null)])
    expect(groups[0]).toMatchObject({ id: "resorts", resorts: [{ name: "New Resort" }] })
  })

  it("returns no groups for no resorts", () => {
    expect(groupDestinations([])).toEqual([])
  })
})
