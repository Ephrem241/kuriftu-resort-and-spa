import { z } from "zod"

import { isIsoDate } from "@/lib/booking/dates"

/**
 * Enquiry rules, shared by the server route (authoritative) and, later,
 * the forms (feedback only). `today` is injected (Africa/Addis_Ababa) so
 * the schema stays pure and testable.
 */

export const ENQUIRY_TYPES = ["event", "meeting", "spa", "contact"] as const
export type EnquiryType = (typeof ENQUIRY_TYPES)[number]

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  event: "event or wedding",
  meeting: "meeting",
  spa: "spa booking",
  contact: "general",
}

export const ENQUIRY_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phone: { min: 6, max: 30 },
  message: { min: 10, max: 2000 },
  eventGuests: { min: 1, max: 2000 },
  spaGuests: { min: 1, max: 20 },
} as const

// C0 controls and DEL, except tab/newline/CR (handled per field).
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const LINE_BREAKS = /[\t\r\n]+/g

/** Single-line text: trimmed, control characters and line breaks removed. */
export function cleanLine(value: string): string {
  return value.replace(CONTROL, "").replace(LINE_BREAKS, " ").trim()
}

/** Multi-line text: trimmed, control characters removed, CRLF → LF. */
export function cleanMultiline(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(CONTROL, "").replace(/\t/g, " ").trim()
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PHONE = /^[0-9+()\-\s]+$/

const line = (message: string) => z.string(message).transform(cleanLine)
const multiline = (message: string) => z.string(message).transform(cleanMultiline)

const name = line("Enter your name").pipe(
  z
    .string()
    .min(ENQUIRY_LIMITS.name.min, "Enter your name")
    .max(ENQUIRY_LIMITS.name.max, "Name is too long")
)

const email = line("Enter a valid email address").pipe(
  z.email("Enter a valid email address").max(ENQUIRY_LIMITS.email.max, "Email is too long")
)

const phone = line("Enter a valid phone number")
  .pipe(
    z.union([
      z.literal(""),
      z
        .string()
        .min(ENQUIRY_LIMITS.phone.min, "Enter a valid phone number")
        .max(ENQUIRY_LIMITS.phone.max, "Enter a valid phone number")
        .regex(PHONE, "Enter a valid phone number"),
    ])
  )
  .optional()

/** Spa requests: staff call back, so phone is required and email optional. */
const requiredPhone = line("Enter your phone number").pipe(
  z
    .string()
    .min(1, "Enter your phone number")
    .min(ENQUIRY_LIMITS.phone.min, "Enter a valid phone number")
    .max(ENQUIRY_LIMITS.phone.max, "Enter a valid phone number")
    .regex(PHONE, "Enter a valid phone number")
)

const optionalEmail = line("Enter a valid email address")
  .pipe(
    z.union([
      z.literal(""),
      z.email("Enter a valid email address").max(ENQUIRY_LIMITS.email.max, "Email is too long"),
    ])
  )
  .optional()

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

/** Preferred time of day, HH:MM (24h), or empty. */
const optionalTime = line("Choose a valid time")
  .pipe(z.union([z.literal(""), z.string().regex(TIME, "Choose a valid time")]))
  .optional()

const resortSlug = line("Choose a resort").pipe(z.string().regex(SLUG, "Choose a resort"))

const treatmentSlug = line("Choose a treatment").pipe(z.string().regex(SLUG, "Choose a treatment"))

const optionalMessage = multiline("Enter a message")
  .pipe(z.string().max(ENQUIRY_LIMITS.message.max, "Message is too long"))
  .optional()

const guests = (limits: { min: number; max: number }) =>
  z
    .number("Enter the number of guests")
    .int("Enter a whole number")
    .min(limits.min, `At least ${limits.min} guest`)
    .max(limits.max, `At most ${limits.max} guests`)

/**
 * Honeypot: hidden from people, filled by bots. Checked by the route.
 * Any non-string value counts as filled.
 */
const honeypot = z.string().optional().catch("filled")

export function createEnquirySchema({ today }: { today: string }) {
  const date = z
    .string("Choose a date")
    .refine(isIsoDate, "Choose a date")
    .refine((d) => d >= today, "Date can't be in the past")

  const base = {
    name,
    email,
    phone,
    website: honeypot,
  }

  const dated = {
    ...base,
    resort: resortSlug.optional(),
    message: optionalMessage,
    startDate: date,
    endDate: date.optional(),
    guests: guests(ENQUIRY_LIMITS.eventGuests),
  }

  const endAfterStart = (v: { startDate?: string; endDate?: string }) =>
    !v.startDate || !v.endDate || v.endDate >= v.startDate
  const endAfterStartIssue = { path: ["endDate"], message: "End date must be on or after the start date" }

  return z.discriminatedUnion(
    "type",
    [
      z.object({ type: z.literal("event"), ...dated }).refine(endAfterStart, endAfterStartIssue),
      z.object({ type: z.literal("meeting"), ...dated }).refine(endAfterStart, endAfterStartIssue),
      z.object({
        type: z.literal("spa"),
        ...base,
        email: optionalEmail,
        phone: requiredPhone,
        treatment: treatmentSlug,
        // Derived from the treatment on the server when absent.
        resort: resortSlug.optional(),
        message: optionalMessage,
        startDate: date,
        time: optionalTime,
        guests: guests(ENQUIRY_LIMITS.spaGuests).optional(),
      }),
      z.object({
        type: z.literal("contact"),
        ...base,
        resort: resortSlug.optional(),
        message: multiline("Tell us a little more").pipe(
          z
            .string()
            .min(ENQUIRY_LIMITS.message.min, "Tell us a little more")
            .max(ENQUIRY_LIMITS.message.max, "Message is too long")
        ),
      }),
    ],
    { error: "Choose an enquiry type" }
  )
}

export type EnquiryInput = z.infer<ReturnType<typeof createEnquirySchema>>

/** The spa request form's fields (client and server share these rules). */
export type SpaEnquiryInput = Extract<EnquiryInput, { type: "spa" }>

/** First error message per top-level field. Messages are ours, never input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = typeof issue.path[0] === "string" ? issue.path[0] : "form"
    errors[key] ??= issue.message
  }
  return errors
}
