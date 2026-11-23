import type { ContactChannels, PostalAddress } from "./types"

/** Address lines for display: street, then "town, region postcode", then country. Empty parts are skipped. */
export function addressLines(address: PostalAddress | null): string[] {
  if (!address) return []
  const town = [address.locality, [address.region, address.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ")
  return [address.street, town, address.country].filter(Boolean)
}

/** True when there is at least one phone or email to show. */
export function hasChannels(channels: ContactChannels): boolean {
  return channels.phones.length > 0 || channels.emails.length > 0
}
