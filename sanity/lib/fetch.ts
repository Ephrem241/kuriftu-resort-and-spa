import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import type { QueryParams } from "next-sanity"

import { client } from "./client"

/**
 * Cached, tagged Sanity fetch. `tags` are the document types (or
 * `type:slug`) the query reads; the revalidate webhook expires them.
 */
export async function sanityFetch<const Query extends string>({
  query,
  params = {},
  tags,
}: {
  query: Query
  params?: QueryParams
  tags: string[]
}) {
  "use cache"
  cacheTag(...tags)
  cacheLife("days")
  return client.fetch(query, params)
}
