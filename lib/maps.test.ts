import { describe, expect, it } from "vitest"

import { googleMapsUrl, osmEmbedUrl } from "./maps"

describe("map URLs", () => {
  const bishoftu = { lat: 8.7802656, lng: 39.0028643 }

  it("builds an OpenStreetMap embed with a bbox and marker", () => {
    const url = new URL(osmEmbedUrl(bishoftu)!)
    expect(url.origin + url.pathname).toBe("https://www.openstreetmap.org/export/embed.html")
    expect(url.searchParams.get("marker")).toBe("8.78027,39.00286")
    expect(url.searchParams.get("bbox")).toBe("38.97286,8.76527,39.03286,8.79527")
  })

  it("builds a Google Maps search link", () => {
    expect(googleMapsUrl(bishoftu)).toBe(
      "https://www.google.com/maps/search/?api=1&query=8.7802656%2C39.0028643"
    )
  })

  it("rejects out-of-range or non-numeric coordinates", () => {
    expect(osmEmbedUrl({ lat: 91, lng: 0 })).toBeNull()
    expect(googleMapsUrl({ lat: Number.NaN, lng: 0 })).toBeNull()
  })
})
