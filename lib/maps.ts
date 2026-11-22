/**
 * Map URLs built only from validated coordinates, so nothing editor-typed
 * reaches an iframe src or an outbound link.
 */
export type GeoPoint = { lat: number; lng: number }

function isValid({ lat, lng }: GeoPoint): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  )
}

const fixed = (n: number) => n.toFixed(5)

/** OpenStreetMap embed centred on the point, with a marker. No API key. */
export function osmEmbedUrl(point: GeoPoint, span = 0.03): string | null {
  if (!isValid(point)) return null
  const { lat, lng } = point
  const bbox = [lng - span, lat - span / 2, lng + span, lat + span / 2].map(fixed).join(",")
  const params = new URLSearchParams({ bbox, layer: "mapnik", marker: `${fixed(lat)},${fixed(lng)}` })
  return `https://www.openstreetmap.org/export/embed.html?${params}`
}

/** Google Maps search link that opens the app or site at the point. */
export function googleMapsUrl(point: GeoPoint): string | null {
  if (!isValid(point)) return null
  const params = new URLSearchParams({ api: "1", query: `${point.lat},${point.lng}` })
  return `https://www.google.com/maps/search/?${params}`
}
