import type { NextRequest } from "next/server"

import { todayInResortZone } from "@/lib/booking/dates"
import { buildEnquiryEmail, sendEmail } from "@/lib/enquiry/email"
import { BodyTooLargeError, allowedOrigins, checkRequest, clientKey, readJsonBody } from "@/lib/enquiry/guard"
import { createRateLimiter } from "@/lib/enquiry/rate-limit"
import { pickFallbackPhone, pickRecipient, type EnquiryContacts, type FallbackPhone } from "@/lib/enquiry/recipients"
import { createEnquirySchema, fieldErrors, type EnquiryInput } from "@/lib/enquiry/schema"
import { siteUrl } from "@/lib/seo/site-url"
import { ENQUIRY_CONTEXT_QUERY } from "@/sanity/queries"
import { freshClient, getWriteClient } from "@/sanity/lib/write-client"

/**
 * Enquiries (event, meeting, spa, contact): validate, guard spam, store in
 * Sanity, then email the resort or department address from content.
 * Responses never echo guest input.
 */

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const fail = (status: number, message: string, extra?: Record<string, unknown>, headers?: HeadersInit) =>
  Response.json({ ok: false, message, ...extra }, { status, headers })

export async function POST(req: NextRequest) {
  const guard = checkRequest(req.headers, { allowedOrigins: allowedOrigins(siteUrl()) })
  if (guard) return fail(guard.status, guard.message)

  let raw: unknown
  try {
    raw = await readJsonBody(req)
  } catch (error) {
    return error instanceof BodyTooLargeError ? fail(413, "Too large") : fail(400, "Invalid body")
  }

  const parsed = createEnquirySchema({ today: todayInResortZone() }).safeParse(raw)
  if (!parsed.success) {
    return fail(400, "Check the highlighted fields", { errors: fieldErrors(parsed.error) })
  }
  const enquiry = parsed.data

  // Honeypot filled: look successful, store nothing, and don't count it.
  if (enquiry.website) return Response.json({ ok: true, emailSent: false, fallbackPhone: null })

  const limit = limiter.hit(clientKey(req.headers))
  if (!limit.allowed) {
    return fail(429, "Too many enquiries, please try again later", undefined, {
      "Retry-After": String(limit.retryAfter),
    })
  }

  let context: Awaited<ReturnType<typeof loadContext>>
  try {
    context = await loadContext(enquiry.resort, enquiry.type === "spa" ? enquiry.treatment : undefined)
  } catch {
    console.error("[enquiry] failed to load contacts")
    return fail(500, "We couldn't send your enquiry", { fallbackPhone: null })
  }

  let resort: Resort = context.resort
  let treatment: { _id: string; title: string } | null = null
  if (enquiry.type === "spa") {
    // The treatment decides the resort: the posted one if it offers it, else its first.
    if (!context.treatment) {
      return fail(400, "Check the highlighted fields", { errors: { treatment: "Choose a treatment" } })
    }
    treatment = context.treatment
    const offeredAt = (context.treatment.resorts ?? []).filter((r) => r !== null)
    resort = offeredAt.find((r) => r.slug === enquiry.resort) ?? offeredAt[0] ?? null
  } else if (enquiry.resort && !resort) {
    return fail(400, "Check the highlighted fields", { errors: { resort: "Choose a resort" } })
  }

  const contacts: EnquiryContacts = {
    resort: resort?.reservationContact ?? null,
    reservations: context.settings?.reservations ?? null,
    headOffice: context.settings?.headOffice ?? null,
  }
  const fallbackPhone: FallbackPhone | null = pickFallbackPhone(enquiry.type, contacts)

  let enquiryId: string
  try {
    enquiryId = await storeEnquiry(enquiry, resort?._id ?? null, treatment?._id ?? null)
  } catch {
    console.error(`[enquiry] failed to store ${enquiry.type} enquiry`)
    return fail(500, "We couldn't send your enquiry", { fallbackPhone })
  }

  const emailSent = await notify(enquiry, enquiryId, resort?.name ?? null, treatment?.title ?? null, contacts)
  return Response.json({ ok: true, emailSent, fallbackPhone })
}

type Context = Awaited<ReturnType<typeof loadContext>>
type Resort = Pick<NonNullable<Context["resort"]>, "_id" | "name" | "reservationContact"> | null

async function loadContext(slug: string | undefined, treatment: string | undefined) {
  return freshClient.fetch(ENQUIRY_CONTEXT_QUERY, { slug: slug ?? "", treatment: treatment ?? "" })
}

async function storeEnquiry(enquiry: EnquiryInput, resortId: string | null, treatmentId: string | null): Promise<string> {
  const doc = {
    _type: "enquiry" as const,
    status: "new",
    type: enquiry.type,
    name: enquiry.name,
    ...(enquiry.email ? { email: enquiry.email } : {}),
    ...(enquiry.phone ? { phone: enquiry.phone } : {}),
    ...(resortId ? { resort: { _type: "reference" as const, _ref: resortId } } : {}),
    ...(treatmentId ? { treatment: { _type: "reference" as const, _ref: treatmentId } } : {}),
    ...("startDate" in enquiry && enquiry.startDate ? { startDate: enquiry.startDate } : {}),
    ...("endDate" in enquiry && enquiry.endDate ? { endDate: enquiry.endDate } : {}),
    ...("time" in enquiry && enquiry.time ? { preferredTime: enquiry.time } : {}),
    ...("guests" in enquiry && enquiry.guests !== undefined ? { guests: enquiry.guests } : {}),
    ...(enquiry.message ? { message: enquiry.message } : {}),
    emailSent: false,
    createdAt: new Date().toISOString(),
  }
  const created = await getWriteClient().create(doc)
  return created._id
}

async function notify(
  enquiry: EnquiryInput,
  enquiryId: string,
  resortName: string | null,
  treatmentName: string | null,
  contacts: EnquiryContacts
): Promise<boolean> {
  const to = pickRecipient(enquiry.type, contacts)
  if (!to) {
    console.error(`[enquiry] no recipient address in content for ${enquiryId}`)
    return false
  }

  const { subject, text } = buildEnquiryEmail({
    enquiry,
    enquiryId,
    resortName,
    treatmentName,
    studioUrl: process.env.SANITY_STUDIO_URL,
  })
  const sent = await sendEmail({ to, replyTo: enquiry.email || undefined, subject, text })
  if (!sent) {
    console.error(`[enquiry] notification email not sent for ${enquiryId}`)
    return false
  }

  try {
    await getWriteClient().patch(enquiryId).set({ emailSent: true }).commit()
  } catch {
    console.error(`[enquiry] couldn't mark ${enquiryId} as emailed`)
  }
  return true
}
