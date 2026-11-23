import { describe, expect, it } from "vitest"

import { filterPhotos, galleryQuery, parseGalleryResort, stepIndex } from "./gallery"
import { mapGalleryPage } from "./map"

const params = (query: string) => new URLSearchParams(query)
const photos = [{ resortSlug: "bishoftu" }, { resortSlug: "entoto" }, { resortSlug: "bishoftu" }]

describe("parseGalleryResort", () => {
  it("keeps a known resort", () => {
    expect(parseGalleryResort(params("resort=bishoftu"), ["bishoftu", "entoto"])).toBe("bishoftu")
  })

  it("falls back to all for unknown or missing values", () => {
    expect(parseGalleryResort(params("resort=nope"), ["bishoftu"])).toBeNull()
    expect(parseGalleryResort(params(""), ["bishoftu"])).toBeNull()
  })
})

describe("galleryQuery", () => {
  it("is empty for all and encodes a resort", () => {
    expect(galleryQuery(null)).toBe("")
    expect(galleryQuery("arba-minch")).toBe("?resort=arba-minch")
  })
})

describe("filterPhotos", () => {
  it("returns every photo for all, or one resort's in order", () => {
    expect(filterPhotos(photos, null)).toHaveLength(3)
    expect(filterPhotos(photos, "bishoftu")).toEqual([photos[0], photos[2]])
  })
})

describe("stepIndex", () => {
  it("wraps at both ends", () => {
    expect(stepIndex(0, -1, 3)).toBe(2)
    expect(stepIndex(2, 1, 3)).toBe(0)
    expect(stepIndex(1, 1, 3)).toBe(2)
    expect(stepIndex(0, 1, 0)).toBe(0)
  })
})


describe("mapGalleryPage", () => {
  const asset = { _id: "image-abc123-2000x1000-jpg", url: "https://cdn.sanity.io/x.jpg", metadata: { lqip: null } }
  const photo = (alt: string) => ({ alt, crop: null, hotspot: null, asset })

  it("flattens resort galleries in order and drops resorts without usable photos", () => {
    const page = mapGalleryPage(
      {
        page: null,
        resorts: [
          { name: "Bishoftu", fullName: null, slug: "bishoftu", images: [photo("Lake view"), photo("Pool")] },
          { name: "Entoto", fullName: "Kuriftu Entoto", slug: "entoto", images: [{ ...photo("Broken"), asset: null }] },
        ],
      } as unknown as Parameters<typeof mapGalleryPage>[0],
      "Fallback"
    )

    expect(page.hero.title).toBe("Gallery")
    expect(page.resorts).toEqual([{ name: "Bishoftu", heading: "Bishoftu", slug: "bishoftu", count: 2 }])
    expect(page.photos.map((p) => [p.resortSlug, p.image.alt])).toEqual([
      ["bishoftu", "Lake view"],
      ["bishoftu", "Pool"],
    ])
  })
})
