import { revalidateTag } from "next/cache"
import type { NextRequest } from "next/server"
import { parseBody } from "next-sanity/webhook"

import { tagsForPayload, type RevalidatePayload } from "@/lib/revalidate"

/**
 * Sanity webhook → expire cached content. The signature is verified with
 * SANITY_REVALIDATE_SECRET; without the secret nothing is revalidated.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set")
    return Response.json({ message: "Not configured" }, { status: 500 })
  }

  let parsed: Awaited<ReturnType<typeof parseBody<RevalidatePayload>>>
  try {
    parsed = await parseBody<RevalidatePayload>(req, secret, true)
  } catch {
    return Response.json({ message: "Invalid body" }, { status: 400 })
  }

  if (parsed.isValidSignature !== true) {
    return Response.json({ message: "Invalid signature" }, { status: 401 })
  }

  const tags = tagsForPayload(parsed.body)
  if (!tags) {
    return Response.json({ message: "Invalid body" }, { status: 400 })
  }

  for (const tag of tags) revalidateTag(tag, "max")
  return Response.json({ revalidated: tags.length })
}
