/**
 * Analytics consent, stored in localStorage. This is a strictly necessary
 * preference, so it is kept before any choice is made. Pure: callers pass
 * the storage, so it is testable without a browser.
 */
export const CONSENT_KEY = "kuriftu-consent"
const CONSENT_VERSION = 1

export type ConsentChoice = "granted" | "denied"
export type ConsentState = ConsentChoice | "undecided"

type StorageLike = Pick<Storage, "getItem" | "setItem">

export function readConsent(storage: StorageLike | undefined): ConsentState {
  try {
    const raw = storage?.getItem(CONSENT_KEY)
    if (!raw) return "undecided"
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === "object" &&
      "v" in parsed &&
      parsed.v === CONSENT_VERSION &&
      "choice" in parsed &&
      (parsed.choice === "granted" || parsed.choice === "denied")
    ) {
      return parsed.choice
    }
    return "undecided"
  } catch {
    return "undecided"
  }
}

/** Returns false when storage is blocked; the choice then lasts this page only. */
export function writeConsent(
  storage: StorageLike | undefined,
  choice: ConsentChoice,
  now: Date = new Date()
): boolean {
  try {
    if (!storage) return false
    storage.setItem(
      CONSENT_KEY,
      JSON.stringify({ v: CONSENT_VERSION, choice, at: now.toISOString() })
    )
    return true
  } catch {
    return false
  }
}

/** localStorage, or undefined where it is unavailable or blocked. */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
