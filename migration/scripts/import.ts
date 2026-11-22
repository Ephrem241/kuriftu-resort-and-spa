/**
 * Import: transformed/import.ndjson → the Studio's dataset, using the
 * developer's Sanity CLI login (no write token).
 *
 *   npm run import               # --replace: converges on rerun (initial load)
 *   npm run import -- --missing  # only creates documents that don't exist yet
 *
 * Once editors start changing migrated content, use --missing so their edits
 * aren't overwritten.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { REPO_ROOT, TRANSFORMED_DIR } from "./lib/paths"

const mode = process.argv.includes("--missing") ? "--missing" : "--replace"
const file = join(TRANSFORMED_DIR, "import.ndjson")
if (!existsSync(file)) {
  console.error("No transformed/import.ndjson. Run npm run transform first.")
  process.exit(1)
}

const studio = join(REPO_ROOT, "studio")
// Same dataset the Studio uses (studio/.env), named explicitly so the CLI never prompts.
const studioEnv = readFileSync(join(studio, ".env"), "utf8")
const dataset = studioEnv.match(/^SANITY_STUDIO_DATASET=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "")
if (!dataset) {
  console.error("SANITY_STUDIO_DATASET is not set in studio/.env")
  process.exit(1)
}
console.log(`Importing ${file} into "${dataset}" (${mode})…`)
const result = spawnSync("npx", ["sanity", "datasets", "import", file, "--dataset", dataset, mode, "--asset-concurrency", "6"], {
  cwd: studio,
  stdio: "inherit",
  shell: process.platform === "win32",
})
process.exit(result.status ?? 1)
