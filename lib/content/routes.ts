/**
 * The one place that turns content links into site paths. Route changes
 * need one edit here (plus the matching tests).
 */

export type LinkTarget = {
  _type: string
  slug: string | null
  resortSlug?: string | null
} | null

export type ContentLink = {
  linkType: string | null
  path?: string | null
  url?: string | null
  target?: LinkTarget
}

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"])

/** Path for a document, or null when it can't be addressed yet. */
export function pathForDocument(target: LinkTarget): string | null {
  if (!target?.slug) return null
  const slug = encodeURIComponent(target.slug)
  switch (target._type) {
    case "resort":
      return `/resorts/${slug}`
    case "room":
      return target.resortSlug
        ? `/resorts/${encodeURIComponent(target.resortSlug)}/rooms/${slug}`
        : null
    case "experience":
      return `/experience/${slug}`
    case "spaTreatment":
      // No treatment detail pages: open the request form with it preselected.
      return `/wellness?treatment=${slug}#spa-booking`
    case "eventPackage":
      return `/event/${slug}`
    case "offer":
      return `/offers/${slug}`
    case "page":
      return `/${slug}`
    default:
      return null
  }
}

/** href for a Sanity `link` object. Unsafe or incomplete links become "#". */
export function hrefFor(link: ContentLink | null | undefined): string {
  if (!link) return "#"
  switch (link.linkType) {
    case "internal":
      return pathForDocument(link.target ?? null) ?? "#"
    case "path":
      return link.path?.startsWith("/") && !link.path.startsWith("//") ? link.path : "#"
    case "external": {
      if (!link.url) return "#"
      try {
        return SAFE_SCHEMES.has(new URL(link.url).protocol) ? link.url : "#"
      } catch {
        return "#"
      }
    }
    default:
      return "#"
  }
}
