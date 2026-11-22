/** Phone parsing for Ethiopian numbers as written on the live site. */

export interface Phone {
  display: string
  tel: string
}

const E164 = /^\+[1-9]\d{6,14}$/

/** Formats an E.164 Ethiopian number the way the brand writes it ("+251 999 222 211"). */
export function formatDisplay(tel: string): string {
  const mobile = tel.match(/^\+251(9\d{2})(\d{3})(\d{3})$/)
  if (mobile) return `+251 ${mobile[1]} ${mobile[2]} ${mobile[3]}`
  const landline = tel.match(/^\+251(\d{2})(\d{3})(\d{4})$/)
  if (landline) return `+251 ${landline[1]} ${landline[2]} ${landline[3]}`
  return tel
}

/**
 * Splits a source phone field ("+2519 24 949494,+2519 11 091185") into
 * numbers. Entries that don't normalise to E.164 (for example the "/52"
 * shorthand in "+251905053151/52") are returned in `rejected`, never guessed.
 */
export function parsePhones(source: string): { phones: Phone[]; rejected: string[] } {
  const phones: Phone[] = []
  const rejected: string[] = []
  for (const raw of source.split(/[,;]/)) {
    const entry = raw.trim()
    if (!entry) continue
    const [main, ...variants] = entry.split("/")
    const tel = main.replace(/[\s().-]/g, "")
    if (E164.test(tel)) {
      if (!phones.some((p) => p.tel === tel)) phones.push({ display: formatDisplay(tel), tel })
    } else {
      rejected.push(main.trim())
    }
    for (const variant of variants) rejected.push(`${main.trim()}/${variant.trim()}`)
  }
  return { phones, rejected }
}
