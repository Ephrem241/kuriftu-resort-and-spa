/**
 * Cache tags to expire for a Sanity webhook payload
 * (projection `{_type, "slug": slug.current}`).
 */

const MAX_TAG_LENGTH = 256
const TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Types the web app never caches (personal data, never queried). */
const IGNORED_TYPES = new Set(["enquiry"])

export type RevalidatePayload = { _type?: unknown; slug?: unknown } | null

export function tagsForPayload(body: RevalidatePayload): string[] | null {
  const type = body?._type
  if (typeof type !== "string" || !TYPE_PATTERN.test(type)) return null
  if (IGNORED_TYPES.has(type)) return []

  const tags = [type]
  const slug = body?.slug
  if (typeof slug === "string" && SLUG_PATTERN.test(slug)) tags.push(`${type}:${slug}`)
  return tags.filter((t) => t.length <= MAX_TAG_LENGTH)
}
