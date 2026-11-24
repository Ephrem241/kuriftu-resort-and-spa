import type { MetadataRoute } from "next"

import { absoluteUrl, isIndexable } from "./site-url"

/**
 * robots.txt rules. Deployments that must not be indexed (Vercel previews,
 * *.vercel.app test hosts) are closed to all crawlers.
 */
export function robotsRules(env: Record<string, string | undefined> = process.env): MetadataRoute.Robots {
  if (!isIndexable(env)) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/design-system"] },
    sitemap: absoluteUrl("/sitemap.xml", env),
  }
}
