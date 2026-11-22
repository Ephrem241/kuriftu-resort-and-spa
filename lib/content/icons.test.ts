import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { ICON_NAMES, isIconName } from "./icons"

describe("icon names", () => {
  it("match the Studio's ICON_OPTIONS values exactly", () => {
    const studioFile = fileURLToPath(
      new URL("../../studio/schemaTypes/objects/feature.ts", import.meta.url)
    )
    const source = readFileSync(studioFile, "utf8")
    const studioValues = [...source.matchAll(/value: '([a-z-]+)'/g)].map((m) => m[1])
    expect(studioValues).toEqual([...ICON_NAMES])
  })

  it("guards unknown values", () => {
    expect(isIconName("bed")).toBe(true)
    expect(isIconName("rocket")).toBe(false)
    expect(isIconName(null)).toBe(false)
  })
})
