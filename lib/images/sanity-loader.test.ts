import { describe, expect, it } from "vitest"

import sanityImageLoader from "./sanity-loader"

const SRC =
  "https://cdn.sanity.io/images/abc123/production/hash-2560x1707.jpg?rect=0,100,2560,1500&w=2560&fit=max&auto=format"

describe("sanityImageLoader", () => {
  it("sets the requested width and quality on a Sanity image URL", () => {
    const url = new URL(sanityImageLoader({ src: SRC, width: 828, quality: 60 }))
    expect(url.hostname).toBe("cdn.sanity.io")
    expect(url.searchParams.get("w")).toBe("828")
    expect(url.searchParams.get("q")).toBe("60")
  })

  it("keeps the crop, fit and auto-format params", () => {
    const url = new URL(sanityImageLoader({ src: SRC, width: 640 }))
    expect(url.searchParams.get("rect")).toBe("0,100,2560,1500")
    expect(url.searchParams.get("fit")).toBe("max")
    expect(url.searchParams.get("auto")).toBe("format")
    expect(url.pathname).toBe("/images/abc123/production/hash-2560x1707.jpg")
  })

  it("defaults quality to 75 and never duplicates w", () => {
    const url = new URL(sanityImageLoader({ src: SRC, width: 1080 }))
    expect(url.searchParams.get("q")).toBe("75")
    expect(url.searchParams.getAll("w")).toEqual(["1080"])
  })

  it("returns any other src unchanged", () => {
    expect(sanityImageLoader({ src: "/brand/leaf.svg", width: 64 })).toBe("/brand/leaf.svg")
    expect(sanityImageLoader({ src: "https://example.com/a.jpg", width: 64 })).toBe("https://example.com/a.jpg")
    expect(sanityImageLoader({ src: "http://cdn.sanity.io/images/a.jpg", width: 64 })).toBe("http://cdn.sanity.io/images/a.jpg")
  })
})
