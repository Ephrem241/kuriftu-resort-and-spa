import { describe, expect, it } from "vitest"

import { mapPage } from "./map"

type PageDoc = Parameters<typeof mapPage>[0]

const asset = {
  _id: "image-abc123-2000x1000-jpg",
  url: "https://cdn.sanity.io/images/test/test/abc123-2000x1000.jpg",
  metadata: { lqip: "data:image/jpeg;base64,xyz", dimensions: { width: 2000, height: 1000 } },
}
const image = (alt: string) => ({ alt, crop: null, hotspot: null, asset })
const body = [{ _type: "block", _key: "b1", children: [{ _type: "span", _key: "s1", text: "Hello", marks: [] }], markDefs: [] }]

function doc(overrides: Partial<PageDoc> = {}): PageDoc {
  return {
    title: "About Us",
    slug: "about",
    hero: { eyebrow: null, title: null, intro: "Built by Ethiopia.", image: image("Guests by the lake") },
    sections: [],
    seo: null,
    ...overrides,
  } as PageDoc
}

describe("mapPage", () => {
  it("defaults the hero title to the page title and falls back SEO to title and intro", () => {
    const page = mapPage(doc())
    expect(page.hero.title).toBe("About Us")
    expect(page.hero.eyebrow).toBe("")
    expect(page.hero.image?.alt).toBe("Guests by the lake")
    expect(page.seo).toMatchObject({ title: "About Us", description: "Built by Ethiopia.", noIndex: false })
  })

  it("keeps the hero's own title and has no image when none is set", () => {
    const page = mapPage(doc({ hero: { eyebrow: "Roadshow", title: "The Roadshow", intro: null, image: null } } as Partial<PageDoc>))
    expect(page.hero).toMatchObject({ eyebrow: "Roadshow", title: "The Roadshow", intro: "", image: null })
  })

  it("maps each block type in order", () => {
    const page = mapPage(
      doc({
        sections: [
          { _key: "t", _type: "textSection", eyebrow: "Our story", heading: "Who we are", body },
          {
            _key: "m",
            _type: "mediaText",
            eyebrow: null,
            heading: "Plastic & Resources",
            body,
            image: image("Refill station"),
            imagePosition: "end",
            link: { label: "Read more", linkType: "path", path: "/sustainability", url: null, target: null },
          },
          { _key: "g", _type: "imageGallery", heading: null, images: [image("One"), image("Two")] },
          { _key: "f", _type: "featureList", heading: "Why", intro: null, items: [{ _key: "i", icon: "spa", title: "Calm" }] },
          {
            _key: "c",
            _type: "callToAction",
            heading: "Plan your stay",
            text: null,
            link: { label: "Destinations", linkType: "path", path: "/destinations", url: null, target: null },
            backgroundImage: null,
          },
          { _key: "v", _type: "videoEmbed", title: "Our story", url: "https://youtu.be/dQw4w9WgXcQ", poster: image("Poster") },
        ],
      } as Partial<PageDoc>)
    )

    expect(page.sections.map((s) => s.type)).toEqual(["text", "mediaText", "gallery", "features", "cta", "video"])
    expect(page.sections[1]).toMatchObject({ imagePosition: "end", link: { label: "Read more", href: "/sustainability" } })
    expect(page.sections[2]).toMatchObject({ heading: "", images: [{ alt: "One" }, { alt: "Two" }] })
    expect(page.sections[4]).toMatchObject({ link: { href: "/destinations" }, image: null })
    expect(page.sections[5]).toMatchObject({ embedUrl: expect.stringContaining("youtube-nocookie.com/embed/dQw4w9WgXcQ") })
  })

  it("drops blocks that cannot render", () => {
    const page = mapPage(
      doc({
        sections: [
          { _key: "t", _type: "textSection", eyebrow: null, heading: "Empty", body: [] },
          { _key: "m", _type: "mediaText", eyebrow: null, heading: "No photo", body, image: null, imagePosition: null, link: null },
          { _key: "g", _type: "imageGallery", heading: "None", images: [{ alt: "x", crop: null, hotspot: null, asset: null }] },
          {
            _key: "c",
            _type: "callToAction",
            heading: "Bad link",
            text: null,
            link: { label: "Go", linkType: "external", path: null, url: "javascript:alert(1)", target: null },
            backgroundImage: null,
          },
          { _key: "v", _type: "videoEmbed", title: "Self-hosted", url: "https://example.com/video.mp4", poster: image("P") },
          { _key: "f", _type: "featureList", heading: null, intro: null, items: [] },
        ],
      } as Partial<PageDoc>)
    )
    expect(page.sections).toEqual([])
  })

  it("falls back the description to the first section's text when there is no intro", () => {
    const page = mapPage(
      doc({
        hero: null,
        sections: [{ _key: "t", _type: "textSection", eyebrow: null, heading: "Who we are", body }],
      } as Partial<PageDoc>)
    )
    expect(page.seo.description).toBe("Hello")
  })

  it("drops a media link that does not resolve and defaults the image position", () => {
    const page = mapPage(
      doc({
        sections: [
          {
            _key: "m",
            _type: "mediaText",
            eyebrow: null,
            heading: "Methodology",
            body: null,
            image: image("Workshop"),
            imagePosition: null,
            link: { label: "Unpublished", linkType: "internal", path: null, url: null, target: null },
          },
        ],
      } as Partial<PageDoc>)
    )
    expect(page.sections[0]).toMatchObject({ type: "mediaText", imagePosition: "start", link: null, body: [] })
  })
})
