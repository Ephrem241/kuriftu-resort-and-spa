import { describe, expect, it } from "vitest"

import { tagsForPayload } from "./revalidate"

describe("tagsForPayload", () => {
  it("returns the type and type:slug tags", () => {
    expect(tagsForPayload({ _type: "resort", slug: "bishoftu" })).toEqual(["resort", "resort:bishoftu"])
    expect(tagsForPayload({ _type: "siteSettings", slug: null })).toEqual(["siteSettings"])
  })

  it("ignores enquiries", () => {
    expect(tagsForPayload({ _type: "enquiry" })).toEqual([])
  })

  it("rejects malformed payloads", () => {
    expect(tagsForPayload(null)).toBeNull()
    expect(tagsForPayload({})).toBeNull()
    expect(tagsForPayload({ _type: 42 })).toBeNull()
    expect(tagsForPayload({ _type: "a b<script>" })).toBeNull()
  })

  it("drops slugs that aren't kebab-case and caps tag length", () => {
    expect(tagsForPayload({ _type: "resort", slug: "Not A Slug" })).toEqual(["resort"])
    const long = "a".repeat(300)
    expect(tagsForPayload({ _type: "resort", slug: long })).toEqual(["resort"])
  })
})
