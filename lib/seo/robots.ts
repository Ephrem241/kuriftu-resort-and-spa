import type { MetadataRoute } from "next"

import { absoluteUrl } from "./site-url"

/**
 * robots.txt rules. Vercel preview deployments (VERCEL_ENV other than
 * "production") are closed to all crawlers so they never get indexed.
 */
export function robotsRules(env: Record<string, string | undefined> = process.env): MetadataRoute.Robots {
  const vercelEnv = env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/design-system"] },
    sitemap: absoluteUrl("/sitemap.xml", env),
  }
}
