import { describe, expect, it } from "vitest"

import { toEmbedUrl } from "./video"

describe("toEmbedUrl", () => {
  it("handles YouTube watch, short, shorts, and embed links", () => {
    const embed = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(embed)
    expect(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(embed)
    expect(toEmbedUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(embed)
    expect(toEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(embed)
  })

  it("handles Vimeo links", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871?autoplay=1&dnt=1"
    )
  })

  it("rejects everything else", () => {
    expect(toEmbedUrl(null)).toBeNull()
    expect(toEmbedUrl("")).toBeNull()
    expect(toEmbedUrl("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(toEmbedUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(toEmbedUrl("https://www.youtube.com/watch?v=bad\"id")).toBeNull()
    expect(toEmbedUrl("javascript:alert(1)")).toBeNull()
  })
})
