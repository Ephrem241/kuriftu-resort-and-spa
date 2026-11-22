import { createHash } from "node:crypto"

export const MAX_BODY_BYTES = 16 * 1024

export type GuardFailure = { status: 403 | 413 | 415; message: string }

/**
 * Cheap request checks before the body is read: same-origin (when the
 * browser sends Origin), JSON only, and a size cap.
 */
export function checkRequest(
  headers: Headers,
  { allowedOrigins }: { allowedOrigins: readonly string[] }
): GuardFailure | null {
  const origin = headers.get("origin")
  if (origin && !allowedOrigins.includes(origin)) {
    return { status: 403, message: "Forbidden" }
  }
  const type = headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
  if (type !== "application/json") {
    return { status: 415, message: "Send JSON" }
  }
  const length = Number(headers.get("content-length"))
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    return { status: 413, message: "Too large" }
  }
  return null
}

/** Origins allowed to post: the site, plus localhost in development. */
export function allowedOrigins(siteOrigin: string, nodeEnv = process.env.NODE_ENV): string[] {
  const origins = [siteOrigin]
  if (nodeEnv !== "production") origins.push("http://localhost:3000", "http://127.0.0.1:3000")
  return [...new Set(origins)]
}

/** Client IP from proxy headers, hashed so the raw address is never kept. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwarded || headers.get("x-real-ip")?.trim() || "unknown"
  return createHash("sha256").update(ip).digest("hex")
}

/** Reads the body as text with a hard byte cap (Content-Length can lie). */
export async function readJsonBody(req: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const text = await req.text()
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new BodyTooLargeError()
  return JSON.parse(text)
}

export class BodyTooLargeError extends Error {}
