import type { EnquiryType } from "./schema"

/** The slice of a Sanity `contactDetails` object the route needs. */
export type ContactSlice = {
  phones?: Array<{ display?: string | null; tel?: string | null } | null> | null
  emails?: Array<{ address?: string | null } | null> | null
} | null

export type EnquiryContacts = {
  resort: ContactSlice
  reservations: ContactSlice
  headOffice: ContactSlice
}

export type FallbackPhone = { display: string; tel: string }

/** Contacts to try, in order, for an enquiry type (AGENTS §11, prompt 10). */
function order(type: EnquiryType, c: EnquiryContacts): ContactSlice[] {
  return type === "contact"
    ? [c.resort, c.headOffice, c.reservations]
    : [c.resort, c.reservations, c.headOffice]
}

/** First email address in the fallback order, or null. */
export function pickRecipient(type: EnquiryType, contacts: EnquiryContacts): string | null {
  for (const contact of order(type, contacts)) {
    const address = contact?.emails?.find((e) => e?.address?.trim())?.address?.trim()
    if (address) return address
  }
  return null
}

/** First phone (display + dialable) in the fallback order, or null. */
export function pickFallbackPhone(type: EnquiryType, contacts: EnquiryContacts): FallbackPhone | null {
  for (const contact of order(type, contacts)) {
    const phone = contact?.phones?.find((p) => p?.display && p?.tel)
    if (phone?.display && phone.tel) return { display: phone.display, tel: phone.tel }
  }
  return null
}
