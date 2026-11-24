"use client"

import { useId, useState, type FormEvent } from "react"
import { CalendarDays, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { addDays, nightsBetween, todayInResortZone } from "@/lib/booking/dates"
import { buildBookingUrl } from "@/lib/booking/handoff"
import type { SiteSettings } from "@/lib/content/types"
import { cn } from "@/lib/utils"

import { FieldShell } from "./field-shell"
import { GuestsPopover } from "./guests-popover"
import { useResortToday } from "./use-resort-today"

type Destination = SiteSettings["bookableResorts"][number]

type AvailabilityBarProps = {
  destinations: Destination[]
  /** Prefill (resort pages). */
  defaultDestination?: string
  source: string
  className?: string
}

type Errors = Partial<Record<"destination" | "checkIn" | "checkOut" | "adults" | "children", string>>

function formatDate(iso: string) {
  if (!iso) return "Add date"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`))
}

const inputOverlay =
  "absolute inset-0 size-full cursor-pointer appearance-none opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"

/**
 * The search schema (and Zod) load on first interaction, not with the page.
 * Client validation still runs before every hand-off.
 */
function loadSearchSchema() {
  return import("@/lib/booking/search-schema").then((m) => m.createSearchSchema)
}

function openPicker(e: React.MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // Some browsers disallow showPicker in certain contexts; native UI still works.
  }
}

export function AvailabilityBar({
  destinations,
  defaultDestination = "",
  source,
  className,
}: AvailabilityBarProps) {
  const id = useId()
  const today = useResortToday()
  const [destination, setDestination] = useState(defaultDestination)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState({ adults: 2, children: 0 })
  const [errors, setErrors] = useState<Errors>({})

  const destinationName = destinations.find((d) => d.slug === destination)?.name
  const checkOutMin = checkIn ? addDays(checkIn, 1) : today ? addDays(today, 1) : undefined

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    let createSearchSchema: Awaited<ReturnType<typeof loadSearchSchema>>
    try {
      createSearchSchema = await loadSearchSchema()
    } catch {
      // The chunk failed to load (offline): skip prefill, hand off to the property.
      const property = destinations.find((d) => d.slug === destination)?.bookingProperty
      window.location.assign(buildBookingUrl({ property }) || "/contact")
      return
    }
    const schema = createSearchSchema({
      bookableSlugs: destinations.map((d) => d.slug),
      today: today || todayInResortZone(),
    })
    const result = schema.safeParse({ destination, checkIn, checkOut, ...guests })

    if (!result.success) {
      const next: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors
        next[key] ??= issue.message
      }
      setErrors(next)
      return
    }

    setErrors({})
    const data = result.data
    const property = destinations.find((d) => d.slug === data.destination)?.bookingProperty
    track("availability_search_submitted", {
      destination: data.destination,
      nights: nightsBetween(data.checkIn, data.checkOut),
      guests: data.adults + data.children,
    })
    track("booking_handoff_clicked", { source, resort: data.destination })

    const url = buildBookingUrl({ property, stay: data })
    window.location.assign(url || "/contact")
  }

  const errorId = (field: keyof Errors) => `${id}-${field}-error`
  const describedBy = (field: keyof Errors) => (errors[field] ? errorId(field) : undefined)

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onFocus={() => void loadSearchSchema().catch(() => {})}
      aria-label="Check availability"
      className={cn(
        "rounded-lg border border-line bg-white p-4 shadow-xl shadow-charcoal/10 md:p-5",
        className
      )}
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto] lg:items-start">
        <div>
          <FieldShell
            icon={MapPin}
            label="Destination"
            htmlFor={`${id}-destination`}
            value={destinationName ?? "Choose a resort"}
            invalid={!!errors.destination}
          >
            <select
              id={`${id}-destination`}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-invalid={!!errors.destination}
              aria-describedby={describedBy("destination")}
              className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            >
              <option value="">Choose a resort</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldError id={errorId("destination")} message={errors.destination} />
        </div>

        <div>
          <FieldShell
            icon={CalendarDays}
            label="Check-in"
            htmlFor={`${id}-check-in`}
            value={formatDate(checkIn)}
            invalid={!!errors.checkIn}
          >
            <input
              id={`${id}-check-in`}
              type="date"
              value={checkIn}
              min={today || undefined}
              onClick={openPicker}
              onChange={(e) => {
                const v = e.target.value
                setCheckIn(v)
                if (v && checkOut && checkOut <= v) setCheckOut(addDays(v, 1))
              }}
              aria-invalid={!!errors.checkIn}
              aria-describedby={describedBy("checkIn")}
              className={inputOverlay}
            />
          </FieldShell>
          <FieldError id={errorId("checkIn")} message={errors.checkIn} />
        </div>

        <div>
          <FieldShell
            icon={CalendarDays}
            label="Check-out"
            htmlFor={`${id}-check-out`}
            value={formatDate(checkOut)}
            invalid={!!errors.checkOut}
          >
            <input
              id={`${id}-check-out`}
              type="date"
              value={checkOut}
              min={checkOutMin}
              onClick={openPicker}
              onChange={(e) => setCheckOut(e.target.value)}
              aria-invalid={!!errors.checkOut}
              aria-describedby={describedBy("checkOut")}
              className={inputOverlay}
            />
          </FieldShell>
          <FieldError id={errorId("checkOut")} message={errors.checkOut} />
        </div>

        <div>
          <GuestsPopover
            adults={guests.adults}
            childCount={guests.children}
            onChange={setGuests}
          />
          <FieldError id={errorId("adults")} message={errors.adults ?? errors.children} />
        </div>

        <Button type="submit" variant="primary" className="h-14 w-full md:col-span-2 lg:col-span-1 lg:px-8">
          <Search aria-hidden="true" strokeWidth={1.5} />
          Search Availability
        </Button>
      </div>
    </form>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-caption text-error">
      {message}
    </p>
  )
}
