/**
 * Extract: snapshot the live site's bundle and every text-bearing literal in it.
 * Output: extracted/<date>/{index.html, bundle.js, source.json, literals.json}
 * and extracted/latest.json pointing at that folder.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { extractLiterals } from "./lib/literals"
import { EXTRACTED_DIR, ORIGIN } from "./lib/paths"

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": "kuriftu-content-migration" } })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.text()
}

async function main() {
  const html = await fetchText(`${ORIGIN}/`)
  const bundlePath = html.match(/\/static\/js\/main\.[a-f0-9]+\.js/)?.[0]
  if (!bundlePath) throw new Error("Could not find main bundle in index.html")
  const bundle = await fetchText(`${ORIGIN}${bundlePath}`)

  const literals = extractLiterals(bundle, ORIGIN)
  const fetchedAt = new Date().toISOString()
  const folder = join(EXTRACTED_DIR, fetchedAt.slice(0, 10))
  await mkdir(folder, { recursive: true })

  await writeFile(join(folder, "index.html"), html)
  await writeFile(join(folder, "bundle.js"), bundle)
  await writeFile(join(folder, "source.json"), JSON.stringify({ origin: ORIGIN, bundlePath, fetchedAt, literals: literals.length }, null, 2))
  await writeFile(join(folder, "literals.json"), JSON.stringify(literals, null, 1))
  await writeFile(join(EXTRACTED_DIR, "latest.json"), JSON.stringify({ folder: fetchedAt.slice(0, 10) }, null, 2))

  console.log(`Extracted ${literals.length} literals from ${bundlePath} (${(bundle.length / 1e6).toFixed(1)} MB) → ${folder}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
