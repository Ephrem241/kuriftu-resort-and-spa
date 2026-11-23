import { BookStayLink } from "@/components/booking/book-stay-link"
import { ContactActions } from "@/components/site/contact-actions"
import { MediaImage } from "@/components/ui/media-image"
import { formatFromPrice } from "@/lib/content/room-facts"
import type { ContentImage, RoomPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type RoomBookPanelProps = {
  room: RoomPage
  /** Full-width band with a photo, used when there is no features card beside it. */
  wide: boolean
  image: ContentImage
}

/** Forest "Book This Room" panel: optional from price and the booking hand-off. */
export function RoomBookPanel({ room, wide, image }: RoomBookPanelProps) {
  const price = formatFromPrice(room.fromPrice)
  const { resort } = room

  return (
    <aside
      aria-labelledby="book-title"
      className="relative isolate flex min-h-64 overflow-hidden rounded-xl bg-forest lg:min-h-[17.5rem]"
    >
      {wide ? (
        <>
          <div className="absolute inset-y-0 right-0 -z-10 w-[60%]">
            <MediaImage image={image} sizes="(min-width: 1025px) 50vw, 60vw" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-forest via-forest/90 to-forest/10" />
        </>
      ) : null}

      <div className={cn("flex flex-col justify-center p-8 lg:p-10", wide && "max-w-md")}>
        <h2 id="book-title" className="text-h4 text-ivory lg:text-[1.75rem]">
          Book This Room
        </h2>
        <p className="mt-3 max-w-72 text-small text-ivory">
          Experience the comfort of our {room.title} at {resort.heading}.
        </p>

        {price ? (
          <p className="mt-5 text-ivory">
            <span className="text-caption">From </span>
            <span className="font-heading text-h3">{price.amount}</span>
            <span className="text-small"> / {price.unit}</span>
            <span className="mt-1 block text-caption text-ivory/80">Final rates are confirmed in booking.</span>
          </p>
        ) : null}

        {resort.bookable ? (
          <BookStayLink
            source="room-cta"
            resort={resort.slug}
            room={room.slug}
            property={resort.bookingProperty}
            label="Check Availability"
            variant="accent"
            className="mt-6 self-start text-charcoal hover:text-ivory"
          />
        ) : (
          <ContactActions phone={resort.phone} email={resort.email} source="room-cta" className="mt-6" />
        )}
      </div>
    </aside>
  )
}
