import { clean } from "./ids"
import type { Json } from "./literals"
import type { TextPart } from "./portable-text"

/**
 * Turns a statically evaluated JSX tree (`{ $el, props }`) from the old site
 * into an ordered list of content items, then groups them into a hero and
 * sections. Only `children`, `src` and `alt` are read, so inline styles and
 * class names never leak into content.
 */

export type Item =
  | { kind: "h1" | "h2" | "h3" | "h4" | "p" | "li" | "quote" | "loose"; text: string }
  | { kind: "img"; src: string; alt?: string }

const SKIP_TAGS = new Set(["title", "meta", "link", "script", "style", "video", "source", "svg", "path", "button", "form", "input", "select", "textarea", "iframe", "noscript", "label"])
const TEXT_TAGS: Record<string, Item["kind"]> = { h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h4", p: "p", li: "li", blockquote: "quote", figcaption: "p" }

type El = { $el: string; props?: Record<string, Json> }
const isEl = (node: Json | undefined): node is El & Json => !!node && typeof node === "object" && !Array.isArray(node) && typeof (node as El).$el === "string"

/** All text inside a node, `<br>` as a space. */
export function textOf(node: Json | undefined | boolean): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isEl(node)) return node.$el === "br" ? " " : textOf(node.props?.children)
  return ""
}

export function linearize(root: Json): Item[] {
  const items: Item[] = []
  ;(function walk(node: Json | undefined | boolean) {
    if (typeof node === "string") {
      const text = clean(node)
      if (text) items.push({ kind: "loose", text })
      return
    }
    if (Array.isArray(node)) return node.forEach(walk)
    if (!isEl(node)) return
    const tag = node.$el
    const props = node.props ?? {}
    if (tag === "video" && typeof props.poster === "string") {
      items.push({ kind: "img", src: props.poster })
      return
    }
    if (SKIP_TAGS.has(tag) || "prioritizeSeoTags" in props) return
    const src = props.src
    if ((tag === "img" || typeof src === "string") && typeof src === "string") {
      items.push({ kind: "img", src, alt: typeof props.alt === "string" ? clean(props.alt) : undefined })
      return
    }
    const kind = TEXT_TAGS[tag]
    if (kind) {
      const text = clean(textOf(props.children))
      if (text) items.push({ kind, text } as Item)
      return
    }
    walk(props.children)
  })(root)
  return items
}

export interface PageSection {
  eyebrow?: string
  heading?: string
  parts: TextPart[]
  images: { src: string; alt?: string }[]
}

export interface PageContent {
  eyebrow?: string
  title?: string
  intro?: string
  heroImage?: { src: string; alt?: string }
  sections: PageSection[]
}

const isEyebrow = (text: string) => text.length <= 60 && !/[.!?]$/.test(text)

export function groupPage(items: Item[]): PageContent {
  const page: PageContent = { sections: [] }
  let index = 0

  // Hero: everything up to and including the first h1, then an optional h2 intro.
  const h1 = items.findIndex((item) => item.kind === "h1")
  if (h1 >= 0) {
    for (const item of items.slice(0, h1)) {
      if (item.kind === "img" && !page.heroImage) page.heroImage = { src: item.src, alt: item.alt }
      else if (item.kind === "loose" && isEyebrow(item.text)) page.eyebrow = item.text
    }
    page.title = (items[h1] as { text: string }).text
    index = h1 + 1
    const next = items[index]
    if (next && (next.kind === "h2" || next.kind === "p")) {
      page.intro = next.text
      index++
    }
  }

  let current: PageSection = { parts: [], images: [] }
  let pendingEyebrow: string | undefined
  let pendingImages: PageSection["images"] = []
  const hasContent = (s: PageSection) => s.parts.length > 0 || s.images.length > 0 || !!s.heading

  const startSection = (heading: string) => {
    if (hasContent(current)) page.sections.push(current)
    current = { heading, eyebrow: pendingEyebrow, parts: [], images: pendingImages }
    pendingEyebrow = undefined
    pendingImages = []
  }

  for (const item of items.slice(index)) {
    switch (item.kind) {
      case "h1":
      case "h2":
      case "h3":
        startSection(item.text)
        break
      case "h4":
      case "quote":
        current.parts.push({ kind: "quote", text: item.text })
        break
      case "p":
        current.parts.push({ kind: "p", text: item.text })
        break
      case "li":
        current.parts.push({ kind: "li", text: item.text })
        break
      case "loose":
        if (isEyebrow(item.text)) pendingEyebrow = item.text
        else current.parts.push({ kind: "p", text: item.text })
        break
      case "img":
        // An image before a section's eyebrow/heading belongs to the next section.
        if (current.parts.length > 0 && !pendingEyebrow) current.images.push({ src: item.src, alt: item.alt })
        else pendingImages.push({ src: item.src, alt: item.alt })
        break
    }
  }
  current.images.push(...pendingImages)
  if (hasContent(current)) page.sections.push(current)
  return page
}
