import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const ORIGIN = "https://www.kurifturesorts.com"

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
export const EXTRACTED_DIR = join(ROOT, "extracted")
export const TRANSFORMED_DIR = join(ROOT, "transformed")
export const REPORTS_DIR = join(ROOT, "reports")
export const MAPPINGS_DIR = join(ROOT, "mappings")
export const REPO_ROOT = join(ROOT, "..")

/** Folder of the most recent extract run. */
export function latestExtract(): string {
  const { folder } = JSON.parse(readFileSync(join(EXTRACTED_DIR, "latest.json"), "utf8")) as { folder: string }
  return join(EXTRACTED_DIR, folder)
}
