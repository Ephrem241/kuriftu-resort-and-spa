import { AmenityGrid } from "@/components/ui/amenity-grid"
import type { Amenity } from "@/lib/content/types"

/** "Resort Amenities": icon circles with labels, as stored in Sanity. */
export function ResortAmenities({ amenities }: { amenities: Amenity[] }) {
  return (
    <AmenityGrid
      id="amenities"
      title="Resort Amenities"
      subtitle="Everything you need for a perfect stay"
      amenities={amenities}
      columns={7}
      className="pt-16 lg:pt-14"
    />
  )
}
