"use client"

import { useId, useRef, useState, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, CalendarDays, ChevronDown, Clock, Phone as PhoneIcon } from "lucide-react"

import { useResortToday } from "@/components/booking/use-resort-today"
import {
  FormField,
  Honeypot,
  OverlayInput,
  PhoneLink,
  formatDate,
  iconClass,
  inputClass,
  openPicker,
  overlayClass,
  postEnquiry,
  type Phone,
} from "@/components/forms/form-parts"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { todayInResortZone } from "@/lib/booking/dates"
import type { ExperienceResort } from "@/lib/content/types"
import { createEnquirySchema, fieldErrors } from "@/lib/enquiry/schema"
import { cn } from "@/lib/utils"

export type TreatmentOptionGroup = { resort: ExperienceResort; treatments: { slug: string; title: string }[] }

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
    const outcome = await postEnquiry<Field>(payload, reservationPhone)
    setSending(false)

    if (outcome.status === "sent") {
      track("enquiry_submitted", { type: "spa" })
      setResult(outcome)
      requestAnimationFrame(() => doneRef.current?.focus())
    } else if (outcome.status === "invalid") {
      setErrors(outcome.errors)
      focusFirstError(outcome.errors)
    } else {
      setResult(outcome)
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
            <PhoneLink phone={result.phone} source="wellness" />.
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
          <PhoneIcon aria-hidden="true" strokeWidth={1.5} className={iconClass} />
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

      <Honeypot id={`${id}-website`} value={values.website} onChange={set("website")} />

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
              Please call <PhoneLink phone={result.phone} source="wellness" /> to book.
            </>
          ) : (
            "Please try again later."
          )}
        </p>
      ) : null}
    </form>
  )
}

