/**
 * Validate: reads the published dataset with the web app's Viewer token and
 * checks it against the transform output. Writes reports/validation.md and
 * exits non-zero when a check fails.
 */
import { readFileSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"

import { createClient } from "@sanity/client"

import { REPO_ROOT, REPORTS_DIR, TRANSFORMED_DIR } from "./lib/paths"

type Doc = { _id: string; _type: string } & Record<string, unknown>

/** Reads KEY=value from an env file, without surrounding quotes. */
function envValue(file: string, key: string): string | undefined {
  const line = readFileSync(join(REPO_ROOT, file), "utf8").match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]
  return line?.trim().replace(/^["']|["']$/g, "")
}

const projectId = envValue("studio/.env", "SANITY_STUDIO_PROJECT_ID")
const dataset = envValue("studio/.env", "SANITY_STUDIO_DATASET")
const token = envValue(".env.local", "SANITY_API_READ_TOKEN")
if (!projectId || !dataset || !token) {
  console.error("Missing SANITY_STUDIO_PROJECT_ID/DATASET (studio/.env) or SANITY_API_READ_TOKEN (.env.local)")
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-21", useCdn: false, perspective: "published" })

interface Check {
  name: string
  ok: boolean
  detail: string
}

function walk(value: unknown, visit: (node: Record<string, unknown>, path: string) => void, path = "") {
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, visit, `${path}[${i}]`))
  else if (value && typeof value === "object") {
    visit(value as Record<string, unknown>, path)
    for (const [k, v] of Object.entries(value)) walk(v, visit, path ? `${path}.${k}` : k)
  }
}

async function main() {
  const expected = JSON.parse(readFileSync(join(TRANSFORMED_DIR, "counts.json"), "utf8")) as Record<string, number>
  const imported = readFileSync(join(TRANSFORMED_DIR, "import.ndjson"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Doc)
  const types = Object.keys(expected)
  const docs = await client.fetch<Doc[]>(`*[_type in $types]`, { types })
  const allIds = new Set(await client.fetch<string[]>(`*[]._id`))
  const checks: Check[] = []
  const check = (name: string, failures: string[], okDetail: string) =>
    checks.push({ name, ok: failures.length === 0, detail: failures.length ? failures.slice(0, 20).join("; ") : okDetail })

  // Counts per type.
  const counts: Record<string, number> = {}
  for (const d of docs) counts[d._type] = (counts[d._type] ?? 0) + 1
  check(
    "Counts match the transform",
    types.filter((t) => counts[t] !== expected[t]).map((t) => `${t}: ${counts[t] ?? 0} in dataset, ${expected[t]} expected`),
    types.map((t) => `${t} ${counts[t]}`).join(", "),
  )

  // Every migrated id is present.
  check(
    "Every migrated document exists",
    imported.filter((d) => !allIds.has(d._id)).map((d) => d._id),
    `${imported.length} documents`,
  )

  // References resolve.
  const refFailures: string[] = []
  let refCount = 0
  for (const d of docs) {
    walk(d, (node, path) => {
      if (typeof node._ref === "string" && node._type === "reference") {
        refCount++
        if (!allIds.has(node._ref)) refFailures.push(`${d._id} ${path} → ${node._ref}`)
      }
    })
  }
  check("References resolve", refFailures, `${refCount} references`)

  // Images: uploaded asset + alt text.
  const imageFailures: string[] = []
  let imageCount = 0
  for (const d of docs) {
    walk(d, (node, path) => {
      if (node._type !== "accessibleImage") return
      imageCount++
      const asset = node.asset as { _ref?: string } | undefined
      if (!asset?._ref) imageFailures.push(`${d._id} ${path}: no asset`)
      else if (!allIds.has(asset._ref)) imageFailures.push(`${d._id} ${path}: asset ${asset._ref} missing`)
      if (typeof node.alt !== "string" || !node.alt.trim()) imageFailures.push(`${d._id} ${path}: no alt`)
    })
  }
  check("Images have an uploaded asset and alt text", imageFailures, `${imageCount} images`)

  // No document points at the old CDNs.
  const legacy = docs.filter((d) => /kuriftu-media(-bucket)?\.s3|kurifturesorts\.com\/(static|assets)/.test(JSON.stringify(d))).map((d) => d._id)
  check("No content points at legacy image hosts", legacy, "none")

  // Slugs unique per type.
  const slugFailures: string[] = []
  const seen = new Map<string, string>()
  for (const d of docs) {
    const slug = (d.slug as { current?: string } | undefined)?.current
    if (!slug) continue
    const key = `${d._type}:${slug}`
    if (seen.has(key)) slugFailures.push(`${key} used by ${seen.get(key)} and ${d._id}`)
    seen.set(key, d._id)
  }
  check("Slugs are unique per type", slugFailures, `${seen.size} slugs`)

  // Each room belongs to exactly one existing resort.
  check(
    "Every room references a resort",
    docs.filter((d) => d._type === "room" && !allIds.has((d.resort as { _ref?: string } | undefined)?._ref ?? "")).map((d) => d._id),
    `${counts.room ?? 0} rooms`,
  )

  // The import never carries enquiries (personal data).
  check("Import contains no enquiries", imported.filter((d) => d._type === "enquiry").map((d) => d._id), "none")

  // Spot checks against known source values.
  const byId = new Map(docs.map((d) => [d._id, d]))
  const spot: string[] = []
  const bishoftu = byId.get("resort.bishoftu") as { geo?: { lat: number; lng: number } } | undefined
  if (bishoftu?.geo?.lat !== 8.7802656 || bishoftu?.geo?.lng !== 39.0028643) spot.push(`Bishoftu geo is ${JSON.stringify(bishoftu?.geo)}`)
  const suite = byId.get("room.bishoftu.1") as { title?: string; amenities?: unknown[] } | undefined
  if (suite?.amenities?.length !== 12) spot.push(`Royal Presidential Suite has ${suite?.amenities?.length} amenities`)
  const offer = docs.find((d) => d._type === "offer") as { endDate?: string; showAsPopup?: boolean } | undefined
  if (!offer?.endDate?.startsWith("2026-11-30") || offer.showAsPopup !== true) spot.push(`Offer end ${offer?.endDate}, popup ${offer?.showAsPopup}`)
  const settings = byId.get("siteSettings") as { reservations?: { phones?: { tel: string }[] } } | undefined
  if (settings?.reservations?.phones?.[0]?.tel !== "+251999222211") spot.push("Reservation phone isn't +251999222211")
  check("Spot checks (Bishoftu geo, suite amenities, offer dates, reservation phone)", spot, "all match the source")

  const failed = checks.filter((c) => !c.ok)
  const lines = [
    "# Content migration validation",
    "",
    `Dataset: ${projectId}/${dataset} (published perspective)`,
    "",
    "| Check | Result | Detail |",
    "| --- | --- | --- |",
    ...checks.map((c) => `| ${c.name} | ${c.ok ? "Pass" : "**Fail**"} | ${c.detail.replace(/\|/g, "\\|")} |`),
    "",
    failed.length ? `${failed.length} check(s) failed.` : "All checks passed.",
    "",
  ]
  await writeFile(join(REPORTS_DIR, "validation.md"), lines.join("\n"))
  for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}: ${c.detail}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
