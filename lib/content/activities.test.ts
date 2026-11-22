import { describe, expect, it } from "vitest"

import { activityTiles } from "./activities"

const img = (alt: string) => ({ src: `https://cdn.sanity.io/images/x/${alt}.jpg`, alt })

describe("activityTiles", () => {
  it("builds one tile per category in a fixed order, then spa and dining", () => {
    const tiles = activityTiles({
      slug: "bishoftu",
      experiences: [
        { category: "family", image: img("cinema") },
        { category: "water", image: img("kayak") },
        { category: "water", image: img("swim") },
      ],
      spaImage: img("spa"),
      diningImage: img("dining"),
    })
    expect(tiles.map((t) => t.label)).toEqual([
      "Water Activities",
      "Family Activities",
      "Spa Treatments",
      "Dining Experience",
    ])
    expect(tiles[0].image.alt).toBe("kayak")
    expect(tiles[0].href).toBe("/experience?resort=bishoftu&category=water")
    expect(tiles[2].href).toBe("/wellness?resort=bishoftu")
    expect(tiles[3].href).toBe("/dining?resort=bishoftu")
  })

  it("uses a dining experience image when there is no dining venue", () => {
    const tiles = activityTiles({
      slug: "awash",
      experiences: [{ category: "dining", image: img("dinner") }],
      spaImage: null,
      diningImage: null,
    })
    expect(tiles).toHaveLength(1)
    expect(tiles[0]).toMatchObject({ key: "dining", image: { alt: "dinner" } })
  })

  it("returns no tiles when the resort has nothing to show", () => {
    expect(activityTiles({ slug: "x", experiences: [], spaImage: null, diningImage: null })).toEqual([])
  })
})
