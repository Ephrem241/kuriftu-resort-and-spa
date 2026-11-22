"use client"

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, CalendarDays, ChevronDown, Clock, Phone } from "lucide-react"

import { useResortToday } from "@/components/booking/use-resort-today"
import { ContactLink } from "@/components/site/contact-link"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { todayInResortZone } from "@/lib/booking/dates"
import type { ExperienceResort } from "@/lib/content/types"
import { createEnquirySchema, fieldErrors } from "@/lib/enquiry/schema"
import { cn } from "@/lib/utils"

export type TreatmentOptionGroup = { resort: ExperienceResort; treatments: { slug: string; title: string }[] }

type Phone = { display: string; tel: string }

type FormProps = {
  options: TreatmentOptionGroup[]
  /** Site reservations, shown when the server can't name a better number. */
  reservationPhone: Phone | null
}

type Field = "name" | "phone" | "treatment" | "startDate" | "time"
type Errors = Partial<Record<Field | "form", string>>
type Values = Record<Field, string> & { website: string }

type Result =
  | { status: "sent"; emailSent: boolean; phone: Phone | null }
  | { status: "failed"; message: string; phone: Phone | null }

const FIELDS: Field[] = ["name", "phone", "treatment", "startDate", "time"]

/** Reads `?treatment=` so treatment cards can preselect it. Render inside <Suspense>. */
export function SpaBookingFormFromUrl(props: FormProps) {
  const requested = useSearchParams().get("treatment") ?? ""
  const known = props.options.some((g) => g.treatments.some((t) => t.slug === requested))
  const treatment = known ? requested : ""
  return <SpaBookingForm key={treatment} {...props} defaultTreatment={treatment} />
}

/** The spa booking request: validated here for feedback, by /api/enquiry for real. */
export function SpaBookingForm({ options, reservationPhone, defaultTreatment = "" }: FormProps & { defaultTreatment?: string }) {
  const id = useId()
  const today = useResortToday()
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    treatment: defaultTreatment,
    startDate: "",
    time: "",
    website: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const set = (field: keyof Values) => (value: string) => setValues((v) => ({ ...v, [field]: value }))
  const fieldId = (field: Field) => `${id}-${field}`
  const errorId = (field: Field) => `${id}-${field}-error`

  function focusFirstError(next: Errors) {
    const first = FIELDS.find((f) => next[f])
    if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return

    const payload = { type: "spa" as const, ...values }
    const schema = createEnquirySchema({ today: today || todayInResortZone() })
    const parsed = schema.safeParse(payload)
    if (!parsed.success) {
      const next = fieldErrors(parsed.error) as Errors
      setErrors(next)
      focusFirstError(next)
      return
    }

    setErrors({})
    setSending(true)
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
        errors?: Errors
        fallbackPhone?: Phone | null
      } | null
      const phone = body?.fallbackPhone ?? reservationPhone

      if (res.ok && body?.ok) {
        track("enquiry_submitted", { type: "spa" })
        setResult({ status: "sent", emailSent: body.emailSent === true, phone })
        requestAnimationFrame(() => doneRef.current?.focus())
      } else if (res.status === 400 && body?.errors) {
        setErrors(body.errors)
        focusFirstError(body.errors)
      } else {
        setResult({ status: "failed", message: body?.message || "We couldn't send your request", phone })
      }
    } catch {
      setResult({ status: "failed", message: "We couldn't send your request", phone: reservationPhone })
    } finally {
      setSending(false)
    }
  }

  if (result?.status === "sent") {
    return (
      <div role="status" className="flex min-h-64 flex-col justify-center gap-3 text-center md:px-6">
        <h3 ref={doneRef} tabIndex={-1} className="text-h3 outline-none">
          Thank you
        </h3>
        <p className="text-body text-charcoal">Your request is with our spa team. We will call you to confirm your appointment.</p>
        {!result.emailSent && result.phone ? (
          <p className="text-small text-charcoal">
            If you don&apos;t hear from us, call{" "}
            <PhoneLink phone={result.phone} />.
          </p>
        ) : null}
      </div>
    )
  }

  const describedBy = (field: Field) => (errors[field] ? errorId(field) : undefined)

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-label="Spa booking request" className="grid gap-x-4 gap-y-4 md:grid-cols-2 md:gap-x-5">
      <FormField label="Full Name" required htmlFor={fieldId("name")} error={errors.name} errorId={errorId("name")}>
        <input
          id={fieldId("name")}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          className={cn(inputClass, errors.name && "border-error")}
        />
      </FormField>

      <FormField label="Phone Number" required htmlFor={fieldId("phone")} error={errors.phone} errorId={errorId("phone")}>
        <div className="relative">
          <Phone aria-hidden="true" strokeWidth={1.5} className={iconClass} />
          <input
            id={fieldId("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+251 91 123 4567"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={cn(inputClass, "pl-10", errors.phone && "border-error")}
          />
        </div>
      </FormField>

      <FormField label="Select Treatment" required htmlFor={fieldId("treatment")} error={errors.treatment} errorId={errorId("treatment")}>
        <div className="relative">
          <select
            id={fieldId("treatment")}
            value={values.treatment}
            onChange={(e) => set("treatment")(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.treatment}
            aria-describedby={describedBy("treatment")}
            className={cn(inputClass, "cursor-pointer appearance-none pr-10", !values.treatment && "text-muted", errors.treatment && "border-error")}
          >
            <option value="">Choose a treatment</option>
            {options.map((group) => (
              <optgroup key={group.resort.slug} label={group.resort.heading}>
                {group.treatments.map((t) => (
                  <option key={t.slug} value={t.slug} className="text-charcoal">
                    {t.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-charcoal" />
        </div>
      </FormField>

      <FormField label="Preferred Date" required htmlFor={fieldId("startDate")} error={errors.startDate} errorId={errorId("startDate")}>
        <OverlayInput
          icon={<CalendarDays aria-hidden="true" strokeWidth={1.5} className={iconClass} />}
          display={values.startDate ? formatDate(values.startDate) : "Select date"}
          empty={!values.startDate}
          invalid={!!errors.startDate}
        >
          <input
            id={fieldId("startDate")}
            type="date"
            value={values.startDate}
            min={today || undefined}
            onClick={openPicker}
            onChange={(e) => set("startDate")(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.startDate}
            aria-describedby={describedBy("startDate")}
            className={overlayClass}
          />
        </OverlayInput>
      </FormField>

      <FormField label="Preferred Time" htmlFor={fieldId("time")} error={errors.time} errorId={errorId("time")}>
        <OverlayInput
          icon={<Clock aria-hidden="true" strokeWidth={1.5} className={iconClass} />}
          display={values.time || "Select time"}
          empty={!values.time}
          invalid={!!errors.time}
        >
          <input
            id={fieldId("time")}
            type="time"
            step={900}
            value={values.time}
            onClick={openPicker}
            onChange={(e) => set("time")(e.target.value)}
            aria-invalid={!!errors.time}
            aria-describedby={describedBy("time")}
            className={overlayClass}
          />
        </OverlayInput>
      </FormField>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set("website")(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          shape="pill"
          disabled={sending}
          className="h-11 w-full disabled:opacity-70"
        >
          {sending ? "Sending…" : "Submit Booking Request"}
          {sending ? null : (
            <ArrowRight
              aria-hidden="true"
              strokeWidth={1.5}
              className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
            />
          )}
        </Button>
      </div>

      {result?.status === "failed" ? (
        <p role="alert" className="text-small text-error md:col-span-2">
          {result.message}.{" "}
          {result.phone ? (
            <>
              Please call <PhoneLink phone={result.phone} /> to book.
            </>
          ) : (
            "Please try again later."
          )}
        </p>
      ) : null}
    </form>
  )
}

const inputClass =
  "h-11 w-full rounded-md border border-line bg-white px-3 text-small text-charcoal placeholder:text-muted transition-colors duration-hover ease-soft hover:border-sage focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"

const iconClass = "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-charcoal"

const overlayClass =
  "absolute inset-0 size-full cursor-pointer appearance-none opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"

function openPicker(e: React.MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // Some browsers disallow showPicker in certain contexts; native UI still works.
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`))
}

function FormField({
  label,
  required,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: string
  required?: boolean
  htmlFor: string
  error?: string
  errorId: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
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
function OverlayInput({
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

function PhoneLink({ phone }: { phone: Phone }) {
  return (
    <ContactLink
      method="phone"
      href={`tel:${phone.tel}`}
      source="wellness"
      className="font-bold text-forest underline underline-offset-4 hover:text-charcoal"
    >
      {phone.display}
    </ContactLink>
  )
}
