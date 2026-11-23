/**
 * Add the old site's menu PDFs to the dining venues in the live dataset
 * (step 22).
 *
 *   npm run transform            # once, so transformed/import.ndjson has the menus
 *   npm run seed:dining-menus
 *
 * Idempotent and safe after editors start working: a venue that already has
 * a menu is left alone, and each PDF is uploaded once (Sanity also dedupes
 * identical files). Only https PDFs from the old site's hosts are fetched
 * (see lib/menus.ts), each checked for a PDF content type and capped at 20 MB.
 * Uses SANITY_API_WRITE_TOKEN from the web app's .env.local; never logged.
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { createClient } from "@sanity/client"

import { menuSource } from "./lib/menus"
import { REPO_ROOT, TRANSFORMED_DIR } from "./lib/paths"

const MAX_BYTES = 20 * 1024 * 1024

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

type VenueRow = { _id: string; menu?: { _sanityAsset?: string; label?: string } }

/** Venue id → menu, from the transformed import (built by `npm run transform`). */
function plannedMenus(): Map<string, { url: string; label: string }> {
  const file = join(TRANSFORMED_DIR, "import.ndjson")
  if (!existsSync(file)) {
    console.error("No transformed/import.ndjson. Run npm run transform first.")
    process.exit(1)
  }
  const out = new Map<string, { url: string; label: string }>()
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.includes('"diningVenue"')) continue
    const doc = JSON.parse(line) as VenueRow & { _type: string }
    const raw = doc._type === "diningVenue" ? doc.menu?._sanityAsset?.replace(/^file@/, "") : undefined
    // Re-checked here so only allowed hosts are ever fetched.
    const source = menuSource(raw, [])
    if (source) out.set(doc._id, { url: source.url, label: doc.menu?.label || source.label })
  }
  return out
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "error" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const type = res.headers.get("content-type") ?? ""
  if (!/application\/(pdf|octet-stream)/i.test(type)) throw new Error(`Not a PDF (${type || "no content type"})`)
  const size = Number(res.headers.get("content-length") ?? 0)
  if (size > MAX_BYTES) throw new Error(`Too large (${size} bytes)`)
  const body = Buffer.from(await res.arrayBuffer())
  if (body.length > MAX_BYTES) throw new Error(`Too large (${body.length} bytes)`)
  if (body.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("Not a PDF (bad signature)")
  return body
}

async function main() {
  const planned = plannedMenus()
  const ids = [...planned.keys()]
  const existing = await client.fetch<{ _id: string; hasMenu: boolean }[]>(
    `*[_type == "diningVenue" && _id in $ids]{ _id, "hasMenu": defined(menu.asset) }`,
    { ids }
  )
  const live = new Map(existing.map((d) => [d._id, d.hasMenu]))
  const assetByUrl = new Map<string, string>()
  let set = 0
  let unchanged = 0
  let failed = 0

  for (const [id, menu] of planned) {
    if (!live.has(id)) {
      console.log(`missing    ${id} (not in the dataset)`)
      failed++
      continue
    }
    if (live.get(id)) {
      console.log(`unchanged  ${id}`)
      unchanged++
      continue
    }
    try {
      let assetId = assetByUrl.get(menu.url)
      if (!assetId) {
        const body = await download(menu.url)
        const filename = decodeURIComponent(new URL(menu.url).pathname.split("/").pop() ?? "menu.pdf").replace(/\+/g, "-")
        const asset = await client.assets.upload("file", body, { filename, contentType: "application/pdf", source: { name: "kurifturesorts.com", id: menu.url, url: menu.url } })
        assetId = asset._id
        assetByUrl.set(menu.url, assetId)
      }
      await client
        .patch(id)
        .setIfMissing({ menu: { _type: "file", asset: { _type: "reference", _ref: assetId }, label: menu.label } })
        .commit()
      console.log(`set        ${id} ← ${menu.label}`)
      set++
    } catch (error) {
      console.log(`failed     ${id}: ${(error as Error).message} (${menu.url})`)
      failed++
    }
  }

  console.log(`\n${set} set, ${unchanged} unchanged, ${failed} failed.`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error((error as Error).message)
  process.exit(1)
})
