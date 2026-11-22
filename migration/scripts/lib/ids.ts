import { createHash } from "node:crypto"

/** "Kuriftu Resort & Spa Bishoftu" → "kuriftu-resort-spa-bishoftu"; "africanVillage" → "african-village". */
export function kebab(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Stable 12-character key for array items, derived from a path string. */
export function stableKey(...parts: (string | number)[]): string {
  return createHash("sha1").update(parts.join("\u0000")).digest("hex").slice(0, 12)
}

/** Collapses runs of whitespace and trims. */
export function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

/** Cuts text to `max` characters on a word boundary, adding an ellipsis when cut. */
export function truncate(text: string, max: number): string {
  const value = clean(text)
  if (value.length <= max) return value
  const cut = value.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, "")}…`
}

/** First sentence(s) of a text that fit in `max` characters, else a word-boundary cut. */
export function summary(text: string, max: number): string {
  const value = clean(text)
  if (value.length <= max) return value
  const sentences = value.match(/[^.!?]+[.!?]+(\s|$)/g) ?? []
  let out = ""
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break
    out += sentence
  }
  return out.trim() || truncate(value, max)
}
