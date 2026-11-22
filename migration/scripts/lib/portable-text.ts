import { clean, stableKey } from "./ids"

/** Portable Text for the `richText` type: plain paragraphs, headings, quotes and bullet lists. */

export interface Span {
  _type: "span"
  _key: string
  text: string
  marks: string[]
}

export interface Block {
  _type: "block"
  _key: string
  style: "normal" | "h2" | "h3" | "blockquote"
  markDefs: []
  children: Span[]
  listItem?: "bullet"
  level?: number
}

export type TextPart =
  | { kind: "p"; text: string }
  | { kind: "h2" | "h3"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "li"; text: string }

function block(keyBase: string, index: number, text: string, style: Block["style"], listItem?: "bullet"): Block {
  const key = stableKey(keyBase, index, text)
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
    ...(listItem ? { listItem, level: 1 } : {}),
  }
}

/** Converts ordered text parts to blocks. Empty parts are dropped. */
export function toBlocks(keyBase: string, parts: TextPart[]): Block[] {
  const blocks: Block[] = []
  parts.forEach((part, index) => {
    const text = clean(part.text)
    if (!text) return
    if (part.kind === "p") blocks.push(block(keyBase, index, text, "normal"))
    else if (part.kind === "li") blocks.push(block(keyBase, index, text, "normal", "bullet"))
    else if (part.kind === "quote") blocks.push(block(keyBase, index, text, "blockquote"))
    else blocks.push(block(keyBase, index, text, part.kind))
  })
  return blocks
}

/** Plain text (paragraphs separated by blank lines or newlines) → blocks. */
export function textToBlocks(keyBase: string, ...texts: (string | undefined | null)[]): Block[] {
  const parts: TextPart[] = []
  for (const text of texts) {
    if (!text) continue
    for (const paragraph of text.split(/\n+/)) parts.push({ kind: "p", text: paragraph })
  }
  return toBlocks(keyBase, parts)
}

/** Bullet list items → blocks. */
export function listToBlocks(keyBase: string, items: string[]): Block[] {
  return toBlocks(
    keyBase,
    items.map((text) => ({ kind: "li", text })),
  )
}
