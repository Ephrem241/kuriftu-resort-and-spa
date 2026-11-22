import { describe, expect, it } from "vitest"

import { clean, kebab, stableKey, summary, truncate } from "./ids"
import { applyFixes, blockedReason, isDescriptiveAlt, normalizeUrl } from "./images"
import { groupPage, linearize } from "./jsx"
import { extractLiterals } from "./literals"
import { formatDisplay, parsePhones } from "./phone"
import { listToBlocks, textToBlocks } from "./portable-text"

describe("ids", () => {
  it("kebab-cases camel case and names", () => {
    expect(kebab("africanVillage")).toBe("african-village")
    expect(kebab("Kuriftu Resort & Spa Bishoftu")).toBe("kuriftu-resort-and-spa-bishoftu")
    expect(kebab("The Royal Presidential  Suite")).toBe("the-royal-presidential-suite")
    expect(kebab("arba-minch")).toBe("arba-minch")
  })

  it("makes stable keys", () => {
    expect(stableKey("a", 1)).toBe(stableKey("a", 1))
    expect(stableKey("a", 1)).not.toBe(stableKey("a", 2))
    expect(stableKey("a")).toMatch(/^[0-9a-f]{12}$/)
  })

  it("cleans, truncates and summarises on word boundaries", () => {
    expect(clean("  a \n b  ")).toBe("a b")
    expect(truncate("one two three four", 10)).toBe("one two…")
    expect(summary("First sentence. Second one is longer.", 20)).toBe("First sentence.")
    expect(summary("short", 20)).toBe("short")
  })
})

describe("phone", () => {
  it("splits and normalises the old site's phone fields", () => {
    expect(parsePhones("+2519 24 949494,+2519 11 091185").phones).toEqual([
      { display: "+251 924 949 494", tel: "+251924949494" },
      { display: "+251 911 091 185", tel: "+251911091185" },
    ])
  })

  it("formats landlines", () => {
    expect(formatDisplay("+251116623808")).toBe("+251 11 662 3808")
  })

  it("rejects shorthand instead of guessing", () => {
    const { phones, rejected } = parsePhones("+251905061020, +251905053151/52")
    expect(phones.map((p) => p.tel)).toEqual(["+251905061020", "+251905053151"])
    expect(rejected).toEqual(["+251905053151/52"])
  })
})

describe("portable text", () => {
  it("turns paragraphs into normal blocks with stable keys and empty markDefs", () => {
    const blocks = textToBlocks("k", "One.\nTwo.")
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toMatchObject({ _type: "block", style: "normal", markDefs: [], children: [{ _type: "span", text: "One.", marks: [] }] })
    expect(textToBlocks("k", "One.\nTwo.")).toEqual(blocks)
  })

  it("makes bullet lists", () => {
    expect(listToBlocks("k", ["a", "b"])[0]).toMatchObject({ listItem: "bullet", level: 1 })
  })
})

describe("images", () => {
  it("normalises relative and apex URLs", () => {
    expect(normalizeUrl("/assets/a b.jpg")).toBe("https://www.kurifturesorts.com/assets/a%20b.jpg")
    expect(normalizeUrl("https://kurifturesorts.com/x.jpg")).toBe("https://www.kurifturesorts.com/x.jpg")
  })

  it("blocks stock photography and non-images", () => {
    expect(blockedReason("https://images.unsplash.com/photo-1?w=1")).toMatch(/Unsplash/)
    expect(blockedReason("https://example.com/a.mp4")).toMatch(/not an image/)
    expect(blockedReason("https://example.com/a.webp")).toBeUndefined()
  })

  it("recognises generated alt text", () => {
    expect(isDescriptiveAlt("Bishoftu gallery image 22")).toBe(false)
    expect(isDescriptiveAlt("Pool villas lit up at dusk")).toBe(true)
  })

  it("applies reviewed URL fixes", () => {
    const fixes = { prefix: [{ from: "/resorts/", to: "/assets/resorts/", reason: "r" }], suffix: [{ from: ".webpp", to: ".webp", reason: "s" }] }
    expect(applyFixes("/resorts/x.jpg", fixes)).toEqual({ url: "/assets/resorts/x.jpg", reason: "r" })
    expect(applyFixes("a.webpp", fixes)).toEqual({ url: "a.webp", reason: "s" })
    expect(applyFixes("a.jpg", fixes)).toEqual({ url: "a.jpg" })
  })
})

describe("literal extraction", () => {
  const bundle = [
    `var m={12:(e,t,n)=>{"use strict";e.exports=n.p+"static/media/a.jpg"}};`,
    `function mod(n){const img=n(12),obj={hero:"https://x.test/h.jpg"};`,
    `return {title:"A sufficiently long title for extraction",image:img,hero:obj.hero,flag:!0,dyn:foo()}}`,
    `function other(){const img=n(99);return {title:"Another long enough title for the test",image:img}}`,
  ].join("")

  it("evaluates literals, resolving media modules and scoped bindings without executing code", () => {
    const literals = extractLiterals(bundle, "https://origin.test", 20)
    const first = literals.find((l) => JSON.stringify(l.value).includes("sufficiently"))!.value as Record<string, unknown>
    expect(first.image).toBe("https://origin.test/static/media/a.jpg")
    expect(first.hero).toBe("https://x.test/h.jpg")
    expect(first.flag).toBe(true)
    expect(first.dyn).toEqual({ $expr: "foo()" })
    const second = literals.find((l) => JSON.stringify(l.value).includes("Another"))!.value as Record<string, unknown>
    expect(second.image).toEqual({ $expr: "img" })
  })
})

describe("jsx pages", () => {
  const el = (tag: string, children: unknown, extra: Record<string, unknown> = {}) => ({ $el: tag, props: { children, ...extra } })
  const tree = el("main", [
    el("header", [el("img", undefined, { src: "/hero.jpg", alt: "Hero photo of the lake" }), "Eyebrow text", el("h1", ["Page", el("br", undefined), "Title"])]),
    el("h2", "Intro paragraph."),
    "Section Eyebrow",
    el("h3", "First section"),
    el("p", "Body one."),
    el("img", undefined, { src: "/one.jpg", alt: "One" }),
    el("ul", [el("li", "Item")]),
    el("div", "Plain div text", { style: { color: "crimson" } }),
  ])

  it("reads only content, never styles", () => {
    const items = linearize(tree as never)
    expect(JSON.stringify(items)).not.toContain("crimson")
  })

  it("groups a hero and sections", () => {
    const page = groupPage(linearize(tree as never))
    expect(page).toMatchObject({ eyebrow: "Eyebrow text", title: "Page Title", intro: "Intro paragraph.", heroImage: { src: "/hero.jpg" } })
    expect(page.sections[0]).toMatchObject({ eyebrow: "Section Eyebrow", heading: "First section" })
    expect(page.sections[0].images).toEqual([{ src: "/one.jpg", alt: "One" }])
  })
})
