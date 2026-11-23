/**
 * Set the TravelBook property id and code on the resorts the engine carries
 * (step 21).
 *
 *   npm run seed:booking-properties
 *
 * Idempotent and safe after editors start working: fields are only set where
 * empty, so an editor's value is never overwritten. The codes come from
 * mappings/resort-hints.json (`bookingProperties`), keyed by the old site's
 * slug. Uses SANITY_API_WRITE_TOKEN from the web app's .env.local; never logged.
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { createClient } from "@sanity/client"

import { REPO_ROOT } from "./lib/paths"

const envFile = join(REPO_ROOT, ".env.local")
if (!existsSync(envFile)) {
  console.error("No .env.local in the repo root.")
  process.exit(1)
}
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")]
    })
)
for (const key of ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_WRITE_TOKEN"]) {
  if (!env[key]) {
    console.error(`${key} is not set in .env.local`)
    process.exit(1)
  }
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-11-21",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type Hints = { bookingProperties: Record<string, { id: string; code: string } | string> }

/** Old-site slugs that became kebab case (see the 301 redirects). */
const toSlug = (legacy: string) => legacy.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

async function main() {
  const hints: Hints = JSON.parse(readFileSync(join(REPO_ROOT, "migration/mappings/resort-hints.json"), "utf8"))

  for (const [legacy, property] of Object.entries(hints.bookingProperties)) {
    if (typeof property === "string") continue // "$comment"
    const slug = toSlug(legacy)
    const doc = await client.fetch<{ _id: string; bookingPropertyId?: string; bookingPropertyCode?: string } | null>(
      `*[_type == "resort" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, bookingPropertyId, bookingPropertyCode }`,
      { slug }
    )
    if (!doc) {
      console.warn(`skip ${slug}: no published resort with this slug`)
      continue
    }
    const before = `${doc.bookingPropertyId ?? "-"}/${doc.bookingPropertyCode ?? "-"}`
    await client
      .patch(doc._id)
      .setIfMissing({ bookingPropertyId: property.id, bookingPropertyCode: property.code })
      .commit()
    const after = await client.fetch<{ id?: string; code?: string }>(
      `*[_id == $id][0]{ "id": bookingPropertyId, "code": bookingPropertyCode }`,
      { id: doc._id }
    )
    const changed = before !== `${after.id ?? "-"}/${after.code ?? "-"}`
    console.log(`${slug}: ${after.id}/${after.code}${changed ? " (set)" : " (unchanged)"}`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
