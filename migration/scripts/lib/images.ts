import { stableKey } from "./ids"
import { ORIGIN } from "./paths"
import type { Report } from "./report"

/**
 * Image handling for the transform: URL normalisation, a blocklist (stock
 * photography, non-images), an availability cache, and alt text resolution.
 */

export interface SanityImage {
  _type: "accessibleImage"
  _key?: string
  _sanityAsset: string
  alt: string
  caption?: string
}

export type UrlStatus = Record<string, { ok: boolean; status: number; type: string }>

interface Fix {
  from: string
  to: string
  reason: string
}
export interface UrlFixes {
  prefix: Fix[]
  suffix: Fix[]
}

/** Applies the reviewed typo fixes from mappings/url-fixes.json to a raw source path. */
export function applyFixes(raw: string, fixes: UrlFixes): { url: string; reason?: string } {
  for (const fix of fixes.prefix) if (raw.startsWith(fix.from)) return { url: fix.to + raw.slice(fix.from.length), reason: fix.reason }
  for (const fix of fixes.suffix) if (raw.endsWith(fix.from)) return { url: raw.slice(0, -fix.from.length) + fix.to, reason: fix.reason }
  return { url: raw }
}

const BLOCKED_HOSTS = ["images.unsplash.com", "unsplash.com"]
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i

/** Generated, non-descriptive alt text from the old site ("Bishoftu gallery image 22"). */
const GENERIC_ALT = /(gallery|detail gallery|carousel|slide)\s+image\s*\d*$|^(image|photo|img|logo|banner|hero)\s*\d*$/i

export function normalizeUrl(raw: string): string {
  let url = raw.trim()
  if (url.startsWith("/")) url = `${ORIGIN}${url}`
  url = url.replace(/^https?:\/\/kurifturesorts\.com\//, `${ORIGIN}/`)
  return encodeURI(decodeURI(url))
}

export function blockedReason(url: string): string | undefined {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return "invalid URL"
  }
  if (BLOCKED_HOSTS.includes(parsed.hostname)) return "stock photography (Unsplash)"
  if (!IMAGE_EXT.test(parsed.pathname)) return "not an image file"
  return undefined
}

export function isDescriptiveAlt(alt: string | undefined | null): alt is string {
  if (!alt) return false
  const value = alt.trim()
  return value.length >= 8 && !GENERIC_ALT.test(value)
}

export class ImageRegistry {
  /** Every normalised URL the transform asked for, for the availability check. */
  readonly requested = new Set<string>()

  constructor(
    private readonly status: UrlStatus,
    private readonly altOverrides: Record<string, string>,
    private readonly report: Report,
    /** Collect-only pass: every non-blocked URL counts as available. */
    private readonly probeOnly = false,
    private readonly fixes: UrlFixes = { prefix: [], suffix: [] },
  ) {}

  /**
   * Builds an `accessibleImage`, or `undefined` when the URL is blocked or
   * unavailable (recorded in the report). `context` is the contextual alt used
   * when the source has no descriptive alt and no override exists.
   */
  image(raw: unknown, where: string, context: string, sourceAlt?: string | null): SanityImage | undefined {
    if (typeof raw !== "string" || !raw.trim()) return undefined
    const fixed = applyFixes(raw.trim(), this.fixes)
    const url = normalizeUrl(fixed.url)
    if (fixed.reason) this.report.flag("image URL fixed", raw.trim(), `${fixed.reason} → ${url}`)
    const blocked = blockedReason(url)
    if (blocked) {
      this.report.skip("image", url, `${blocked} (${where})`)
      return undefined
    }
    this.requested.add(url)
    const state = this.probeOnly ? { ok: true, status: 200, type: "image/probe" } : this.status[url]
    if (!state) throw new Error(`No availability result for ${url}`)
    if (!state.ok) {
      this.report.skip("image", url, `HTTP ${state.status} ${state.type} (${where})`)
      return undefined
    }

    let alt = this.altOverrides[url]
    if (!alt && isDescriptiveAlt(sourceAlt)) alt = sourceAlt.trim()
    if (!alt) {
      alt = context
      this.report.contextualAlt(url, context, where)
    }
    return { _type: "accessibleImage", _sanityAsset: `image@${url}`, alt }
  }

  /** Builds a de-duplicated image array with stable keys. */
  images(raws: unknown[], where: string, context: (index: number) => string, alts: (string | null | undefined)[] = []): SanityImage[] {
    const out: SanityImage[] = []
    const seen = new Set<string>()
    raws.forEach((raw, index) => {
      const img = this.image(raw, where, context(out.length + 1), alts[index])
      if (!img || seen.has(img._sanityAsset)) return
      seen.add(img._sanityAsset)
      out.push({ ...img, _key: stableKey(where, img._sanityAsset) })
    })
    return out
  }
}

/** HEAD (falling back to a 1-byte GET) every URL not already in the cache. */
export async function checkUrls(urls: Iterable<string>, cache: UrlStatus, concurrency = 8): Promise<UrlStatus> {
  const pending = [...urls].filter((url) => !cache[url])
  let index = 0
  async function worker() {
    while (index < pending.length) {
      const url = pending[index++]
      cache[url] = await probe(url)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return cache
}

async function probe(url: string): Promise<UrlStatus[string]> {
  const headers = { "user-agent": "kuriftu-content-migration" }
  try {
    let res = await fetch(url, { method: "HEAD", headers })
    if (!res.ok) res = await fetch(url, { headers: { ...headers, range: "bytes=0-0" } })
    const type = res.headers.get("content-type") ?? ""
    return { ok: res.ok && type.startsWith("image/"), status: res.status, type }
  } catch (error) {
    return { ok: false, status: 0, type: String((error as Error).message) }
  }
}
