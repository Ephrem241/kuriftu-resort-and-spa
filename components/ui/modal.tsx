"use client"

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react"

import { cn } from "@/lib/utils"

import { usePresence } from "./use-presence"

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible name (use this or `labelledBy`). */
  label?: string
  /** Id of the element that names the dialog. */
  labelledBy?: string
  /** Full-screen layer behind the popup; clicking it closes. */
  backdropClassName: string
  popupClassName: string
  /** Element to focus after closing. Defaults to whatever had focus on open. */
  finalFocus?: () => HTMLElement | null
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  children: ReactNode
}

/**
 * Modal on the native `<dialog>` (showModal): top layer, page made inert,
 * Escape closes, page scroll locked, focus returned on close. Rendered only
 * while open or closing, like a portal.
 */
export function Modal({
  open,
  onOpenChange,
  label,
  labelledBy,
  backdropClassName,
  popupClassName,
  finalFocus,
  onKeyDown,
  children,
}: ModalProps) {
  const { ref, mounted, presenceProps } = usePresence<HTMLDialogElement>(open)
  const popupRef = useRef<HTMLDivElement>(null)
  const finalFocusRef = useRef(finalFocus)
  const openRef = useRef(open)

  useEffect(() => {
    finalFocusRef.current = finalFocus
    openRef.current = open
  })

  useEffect(() => {
    const dialog = ref.current
    if (!mounted || !dialog) return

    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    popupRef.current?.focus()

    const html = document.documentElement
    const prev = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter }
    // Keep the scrollbar's space so the page behind does not shift.
    if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = "stable"
    html.style.overflow = "hidden"

    return () => {
      html.style.overflow = prev.overflow
      html.style.scrollbarGutter = prev.gutter
      if (dialog.open) dialog.close()
      const target = finalFocusRef.current?.() ?? returnTo
      if (target?.isConnected) target.focus()
    }
  }, [mounted, ref])

  if (!mounted) return null

  return (
    <dialog
      ref={ref}
      aria-label={label}
      aria-labelledby={labelledBy}
      // Escape: animate out instead of the browser's instant close.
      onCancel={(e) => {
        e.preventDefault()
        onOpenChange(false)
      }}
      // The browser may still force-close (a repeated Escape): sync state.
      onClose={() => {
        if (openRef.current) onOpenChange(false)
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 text-inherit backdrop:bg-transparent"
    >
      <div aria-hidden="true" className={backdropClassName} onClick={() => onOpenChange(false)} {...presenceProps} />
      <div
        ref={popupRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn("outline-none", popupClassName)}
        {...presenceProps}
      >
        {children}
      </div>
    </dialog>
  )
}
