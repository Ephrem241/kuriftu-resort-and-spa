import "server-only"

import { client } from "./client"

/**
 * Write access for the enquiry route only. Uses a server-only Editor token
 * (SANITY_API_WRITE_TOKEN); never import this from a page or component.
 */
export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not set")
  return client.withConfig({ token, useCdn: false, perspective: "raw" })
}

/** Fresh (uncached, non-CDN) reads for the enquiry route. */
export const freshClient = client.withConfig({ useCdn: false })
