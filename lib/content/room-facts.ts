import type { RoomPage } from "./types"

export type RoomFact = { key: "bed" | "guests" | "size" | "view"; label: string }

const SQ_FT_PER_SQ_M = 10.7639

/** "35 m² (377 ft²)". */
export function formatSize(sqm: number): string {
  const ft = Math.round(sqm * SQ_FT_PER_SQ_M)
  const m = Number.isInteger(sqm) ? sqm : Math.round(sqm * 10) / 10
  return `${m} m² (${ft.toLocaleString("en-US")} ft²)`
}

/** The facts card items, in design order. Empty fields are skipped. */
export function roomFacts(
  room: Pick<RoomPage, "bedConfiguration" | "maxGuests" | "sizeSqm" | "view">
): RoomFact[] {
  const facts: RoomFact[] = []
  if (room.bedConfiguration) facts.push({ key: "bed", label: room.bedConfiguration })
  if (room.maxGuests && room.maxGuests > 0) {
    facts.push({ key: "guests", label: `${room.maxGuests} ${room.maxGuests === 1 ? "Guest" : "Guests"}` })
  }
  if (room.sizeSqm && room.sizeSqm > 0) facts.push({ key: "size", label: formatSize(room.sizeSqm) })
  if (room.view) facts.push({ key: "view", label: room.view })
  return facts
}

/** { amount: "ETB 4,500", unit: "night" }, or null when no price was entered. */
export function formatFromPrice(price: RoomPage["fromPrice"]): { amount: string; unit: string } | null {
  if (!price || !(price.amount > 0)) return null
  const amount = price.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
  const unit = price.unit.replace(/^per\s+/i, "") || "night"
  return { amount: `${price.currency} ${amount}`, unit }
}
