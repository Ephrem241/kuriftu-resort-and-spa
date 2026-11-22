/**
 * The public origin of the site, for canonical URLs, the sitemap and
 * JSON-LD. Set NEXT_PUBLIC_SITE_URL; a production build without it fails
 * rather than publishing localhost URLs.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`NEXT_PUBLIC_SITE_URL must be an http(s) URL, got "${raw}"`)
    }
    return url.origin
  }
  if (env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set. Add the public site origin, e.g. https://www.kurifturesorts.com")
  }
  return "http://localhost:3000"
}

/** Absolute URL for a site path. */
export function absoluteUrl(path: string, env?: Record<string, string | undefined>): string {
  return new URL(path, siteUrl(env)).toString()
}
