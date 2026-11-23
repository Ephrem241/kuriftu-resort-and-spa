import { ENQUIRY_TYPE_LABELS, EVENT_TYPE_LABELS, cleanLine, type EnquiryInput } from "./schema"

/**
 * Notification email for a stored enquiry. Plain text only: guest input is
 * never rendered as HTML, and the subject is a single line.
 */
export function buildEnquiryEmail({
  enquiry,
  enquiryId,
  resortName,
  treatmentName,
  packageName,
  studioUrl,
}: {
  enquiry: EnquiryInput
  enquiryId: string
  resortName: string | null
  /** Spa requests: the treatment's title from content (never the posted slug). */
  treatmentName?: string | null
  /** Event enquiries: the package's title from content (never the posted slug). */
  packageName?: string | null
  studioUrl?: string
}): { subject: string; text: string } {
  const label = ENQUIRY_TYPE_LABELS[enquiry.type]
  const subject = cleanLine(`New ${label} enquiry — ${resortName ?? "Kuriftu"}`)

  const rows: Array<[string, string | number | undefined]> = [
    ["Type", label],
    ["Resort", resortName ?? undefined],
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || undefined],
  ]
  if (enquiry.type === "event" || enquiry.type === "meeting") {
    rows.push(
      ["Event type", enquiry.eventType ? EVENT_TYPE_LABELS[enquiry.eventType] : undefined],
      ["Package", packageName ?? undefined],
      ["Date from", enquiry.startDate || undefined],
      ["Date to", enquiry.endDate || undefined],
      ["Guests", enquiry.guests]
    )
  } else if (enquiry.type === "spa") {
    rows.push(
      ["Treatment", treatmentName ?? undefined],
      ["Preferred date", enquiry.startDate],
      ["Preferred time", enquiry.time || undefined],
      ["Guests", enquiry.guests]
    )
  }

  const lines = rows
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${value}`)

  if (enquiry.message) lines.push("", "Message:", enquiry.message)

  const base = studioUrl?.trim().replace(/\/+$/, "")
  if (base) {
    lines.push("", `Open in Studio: ${base}/intent/edit/id=${encodeURIComponent(enquiryId)};type=enquiry`)
  }
  lines.push(
    "",
    enquiry.email
      ? "Reply to this email to answer the guest directly."
      : "No email given. Call the guest to confirm."
  )

  return { subject, text: lines.join("\n") }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails"

/**
 * Sends through Resend's REST API. Returns false (never throws) when the
 * provider isn't configured, times out, or rejects the message.
 */
export async function sendEmail(
  {
    to,
    replyTo,
    subject,
    text,
  }: { to: string; replyTo?: string; subject: string; text: string },
  {
    apiKey = process.env.RESEND_API_KEY,
    from = process.env.ENQUIRY_FROM_EMAIL,
    timeoutMs = 5000,
    fetchImpl = fetch,
  }: { apiKey?: string; from?: string; timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<boolean> {
  if (!apiKey || !from) return false
  try {
    const res = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject, text }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res.ok
  } catch {
    return false
  }
}
