import type { ResortType } from "./types"

export type DestinationGroupId = "resorts" | "adventure"

/** The /destinations sections, in page order, with the resort types each holds. */
export const DESTINATION_GROUPS: {
  id: DestinationGroupId
  title: string
  subtitle: string
  types: readonly ResortType[]
}[] = [
  {
    id: "resorts",
    title: "Resorts & Spas",
    subtitle: "Lakeside, mountain and savannah retreats",
    types: ["resortAndSpa"],
  },
  {
    id: "adventure",
    title: "Adventure & Wellness",
    subtitle: "Parks and spa days for every kind of guest",
    types: ["adventurePark", "waterPark", "daySpa"],
  },
]

/**
 * Split resorts into the page's groups, each sorted by name. Groups with no
 * resorts are left out; a resort with an unknown type joins the first group.
 */
export function groupDestinations<T extends { name: string; type: ResortType | null }>(resorts: T[]) {
  const groupOf = (type: ResortType | null) =>
    Math.max(0, DESTINATION_GROUPS.findIndex((g) => type !== null && g.types.includes(type)))
  const byName = [...resorts].sort((a, b) => a.name.localeCompare(b.name, "en"))

  return DESTINATION_GROUPS.map(({ id, title, subtitle }, i) => ({
    id,
    title,
    subtitle,
    resorts: byName.filter((r) => groupOf(r.type) === i),
  })).filter((g) => g.resorts.length > 0)
}
