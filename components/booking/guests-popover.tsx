"use client"

import { Popover } from "@base-ui/react/popover"
import { ChevronDown, Minus, Plus, Users } from "lucide-react"

import { GUEST_LIMITS } from "@/lib/booking/search-schema"

import { fieldShellClass } from "./field-shell"

type GuestsPopoverProps = {
  adults: number
  childCount: number
  onChange: (next: { adults: number; children: number }) => void
}

function guestsLabel(adults: number, children: number) {
  const a = `${adults} ${adults === 1 ? "Adult" : "Adults"}`
  if (!children) return a
  return `${a}, ${children} ${children === 1 ? "Child" : "Children"}`
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  const btn =
    "flex size-9 cursor-pointer items-center justify-center rounded-full border border-forest text-forest transition-colors duration-hover hover:bg-forest hover:text-ivory disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div>
        <p className="text-small font-bold text-charcoal">{label}</p>
        <p className="text-caption text-charcoal">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btn}
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
        <output aria-live="polite" aria-label={label} className="w-5 text-center text-body">
          {value}
        </output>
        <button
          type="button"
          className={btn}
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function GuestsPopover({ adults, childCount, onChange }: GuestsPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className={`${fieldShellClass} group cursor-pointer text-left`}>
        <Users aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0 text-forest" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-caption text-charcoal">Guests</span>
          <span className="truncate text-small text-charcoal">
            {guestsLabel(adults, childCount)}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-4 shrink-0 text-charcoal transition-transform duration-hover group-data-popup-open:rotate-180"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" className="z-40">
          <Popover.Popup className="w-72 rounded-md border border-line bg-ivory px-5 py-2 shadow-lg transition-opacity duration-hover data-ending-style:opacity-0 data-starting-style:opacity-0">
            <Popover.Title className="sr-only">Guests</Popover.Title>
            <Stepper
              label="Adults"
              hint="Ages 13+"
              value={adults}
              min={GUEST_LIMITS.adults.min}
              max={GUEST_LIMITS.adults.max}
              onChange={(n) => onChange({ adults: n, children: childCount })}
            />
            <div className="h-px bg-line" />
            <Stepper
              label="Children"
              hint="Ages 0–12"
              value={childCount}
              min={GUEST_LIMITS.children.min}
              max={GUEST_LIMITS.children.max}
              onChange={(n) => onChange({ adults, children: n })}
            />
            <Popover.Close className="mt-2 mb-2 w-full cursor-pointer rounded-md py-2 text-small font-bold text-forest hover:bg-beige">
              Done
            </Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
