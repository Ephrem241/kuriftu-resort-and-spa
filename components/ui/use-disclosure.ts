"use client"

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react"

import { usePresence } from "./use-presence"

/**
 * A button that shows and hides a panel next to it (WAI-ARIA disclosure).
 * Escape closes and returns focus to the button. A pointer press outside,
 * or keyboard focus leaving, closes it too.
 */
export function useDisclosure<R extends HTMLElement = HTMLDivElement, P extends HTMLElement = HTMLDivElement>() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<R>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const { ref: panelRef, mounted, presenceProps } = usePresence<P>(open)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  function close({ returnFocus = false } = {}) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const rootProps = {
    ref: rootRef,
    onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || !open) return
      e.preventDefault()
      e.stopPropagation()
      close({ returnFocus: true })
    },
    onBlur(e: FocusEvent) {
      // Only keyboard moves (Tab) carry a target; pointer presses are handled above.
      const next = e.relatedTarget as Node | null
      if (open && next && !rootRef.current?.contains(next)) setOpen(false)
    },
  }

  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    "aria-expanded": open,
    "aria-controls": mounted ? panelId : undefined,
    "data-popup-open": open ? "" : undefined,
    onClick: () => setOpen((o) => !o),
  }

  const panelProps = { id: panelId, ref: panelRef, ...presenceProps }

  return { open, setOpen, close, mounted, rootProps, triggerProps, panelProps }
}
