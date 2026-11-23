"use client"

import type { MouseEvent, ReactNode } from "react"

import { ContactLink } from "@/components/site/contact-link"
import { cn } from "@/lib/utils"

/** Shared pieces of the enquiry forms (spa booking, event enquiry). */

export type Phone = { display: string; tel: string }

export const inputClass =
  "h-11 w-full rounded-md border border-line bg-white px-3 text-small text-charcoal placeholder:text-muted transition-colors duration-hover ease-soft hover:border-sage focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"

export const iconClass = "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-charcoal"

export const overlayClass =
  "absolute inset-0 size-full cursor-pointer appearance-none opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"

export function openPicker(e: MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // Some browsers disallow showPicker in certain contexts; native UI still works.
  }
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`))
}

export function FormField({
  label,
  required,
  htmlFor,
  error,
  errorId,
  className,
  children,
}: {
  label: string
  required?: boolean
  htmlFor: string
  error?: string
  errorId: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-bold text-charcoal">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-error"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** A native date/time input stretched invisibly over a styled field showing its value. */
export function OverlayInput({
  icon,
  display,
  empty,
  invalid,
  children,
}: {
  icon: ReactNode
  display: string
  empty: boolean
  invalid: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex h-11 items-center rounded-md border border-line bg-white pr-3 pl-10 text-small transition-colors duration-hover ease-soft hover:border-sage focus-within:border-forest has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold",
        invalid && "border-error"
      )}
    >
      {icon}
      <span aria-hidden="true" className={cn("truncate", empty ? "text-muted" : "text-charcoal")}>
        {display}
      </span>
      {children}
    </div>
  )
}

/** Honeypot: hidden from people and assistive tech; bots fill it. */
export function Honeypot({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function PhoneLink({ phone, source }: { phone: Phone; source: string }) {
  return (
    <ContactLink
      method="phone"
      href={`tel:${phone.tel}`}
      source={source}
      className="font-bold text-forest underline underline-offset-4 hover:text-charcoal"
    >
      {phone.display}
    </ContactLink>
  )
}

export type EnquiryOutcome<F extends string> =
  | { status: "sent"; emailSent: boolean; phone: Phone | null }
  | { status: "invalid"; errors: Partial<Record<F | "form", string>> }
  | { status: "failed"; message: string; phone: Phone | null }

/** Posts to /api/enquiry and normalises the reply. Never throws. */
export async function postEnquiry<F extends string>(
  payload: Record<string, unknown>,
  fallbackPhone: Phone | null
): Promise<EnquiryOutcome<F>> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean
      message?: string
      emailSent?: boolean
      errors?: Partial<Record<F | "form", string>>
      fallbackPhone?: Phone | null
    } | null
    const phone = body?.fallbackPhone ?? fallbackPhone

    if (res.ok && body?.ok) return { status: "sent", emailSent: body.emailSent === true, phone }
    if (res.status === 400 && body?.errors) return { status: "invalid", errors: body.errors }
    return { status: "failed", message: body?.message || "We couldn't send your request", phone }
  } catch {
    return { status: "failed", message: "We couldn't send your request", phone: fallbackPhone }
  }
}
