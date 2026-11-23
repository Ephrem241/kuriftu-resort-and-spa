"use client"

import { useId, useRef, useState, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, CalendarDays, ChevronDown, Phone as PhoneIcon, Send } from "lucide-react"

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
import { EVENT_TYPE_OPTIONS, enquiryTypeFor, parseEnquiryPreset, type EnquiryPreset } from "@/lib/content/events"
import type { ExperienceResort, PackageOption } from "@/lib/content/types"
import { createEnquirySchema, fieldErrors, type EventType } from "@/lib/enquiry/schema"
import { cn } from "@/lib/utils"

type FormProps = {
  packages: PackageOption[]
  /** Resorts the form can be preset with (`?resort=`). */
  resorts: ExperienceResort[]
  /** Site reservations, shown when the server can't name a better number. */
  reservationPhone: Phone | null
}

type Field = "name" | "phone" | "eventType" | "startDate" | "message"
type Errors = Partial<Record<Field | "form", string>>
type Values = Record<Field, string> & { website: string }

type Result =
  | { status: "sent"; emailSent: boolean; phone: Phone | null }
  | { status: "failed"; message: string; phone: Phone | null }

const FIELDS: Field[] = ["name", "phone", "eventType", "startDate", "message"]
const EMPTY_PRESET: EnquiryPreset = { eventType: "", package: null, resort: null }
const SOURCE = "events"

/** Reads `?type=`, `?package=` and `?resort=` so tiles, packages and venues can preset the form. Render inside <Suspense>. */
export function EventEnquiryFormFromUrl(props: FormProps) {
  const preset = parseEnquiryPreset(useSearchParams(), props.packages, props.resorts)
  const key = `${preset.eventType}|${preset.package?.slug ?? ""}|${preset.resort?.slug ?? ""}`
  return <EventEnquiryForm key={key} {...props} preset={preset} />
}

/** The event enquiry: validated here for feedback, by /api/enquiry for real. */
export function EventEnquiryForm({ reservationPhone, preset = EMPTY_PRESET }: FormProps & { preset?: EnquiryPreset }) {
  const id = useId()
  const today = useResortToday()
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    eventType: preset.eventType,
    startDate: "",
    message: "",
    website: "",
  })
  // A package or resort preset applies until the guest clears it.
  const [context, setContext] = useState({ package: preset.package, resort: preset.resort })
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const set = (field: keyof Values) => (value: string) => setValues((v) => ({ ...v, [field]: value }))
  const fieldId = (field: Field) => `${id}-${field}`
  const errorId = (field: Field) => `${id}-${field}-error`
  const describedBy = (field: Field) => (errors[field] ? errorId(field) : undefined)

  function focusFirstError(next: Errors) {
    const first = FIELDS.find((f) => next[f])
    if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return

    const eventType = values.eventType as EventType | ""
    const type = enquiryTypeFor(eventType)
    const payload = {
      type,
      ...values,
      ...(context.package ? { package: context.package.slug } : {}),
      ...(context.resort ? { resort: context.resort.slug } : {}),
    }
    const parsed = createEnquirySchema({ today: today || todayInResortZone() }).safeParse(payload)
    if (!parsed.success) {
      const next = fieldErrors(parsed.error) as Errors
      setErrors(next)
      focusFirstError(next)
      return
    }

    setErrors({})
    setSending(true)
    const outcome = await postEnquiry<Field | "package" | "resort">(payload, reservationPhone)
    setSending(false)

    if (outcome.status === "sent") {
      track("enquiry_submitted", { type })
      setResult(outcome)
      requestAnimationFrame(() => doneRef.current?.focus())
    } else if (outcome.status === "invalid") {
      const { package: packageError, resort: resortError, ...fieldErrs } = outcome.errors
      // A stale package or resort link: drop it so the guest can still send.
      if (packageError || resortError) {
        setContext({ package: null, resort: null })
        setResult({
          status: "failed",
          message: "That package or venue is no longer available. Please send your enquiry again",
          phone: reservationPhone,
        })
      }
      setErrors(fieldErrs)
      focusFirstError(fieldErrs)
    } else {
      setResult(outcome)
    }
  }

  if (result?.status === "sent") {
    return (
      <div role="status" className="flex min-h-56 flex-col justify-center gap-3 text-center md:px-6">
        <h3 ref={doneRef} tabIndex={-1} className="text-h3 outline-none">
          Thank you
        </h3>
        <p className="text-body text-charcoal">Your enquiry is with our events team. We will call you to plan the details.</p>
        {!result.emailSent && result.phone ? (
          <p className="text-small text-charcoal">
            If you don&apos;t hear from us, call <PhoneLink phone={result.phone} source={SOURCE} />.
          </p>
        ) : null}
      </div>
    )
  }

  const about = [context.package?.title, context.resort?.heading].filter(Boolean).join(" · ")

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-label="Event enquiry" className="grid gap-x-5 gap-y-4 md:grid-cols-2">
      {about ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-charcoal md:col-span-2">
          <span>
            <span className="font-bold">Enquiring about:</span> {about}
          </span>
          <button
            type="button"
            onClick={() => setContext({ package: null, resort: null })}
            className="cursor-pointer text-caption font-bold text-forest underline underline-offset-4 hover:text-charcoal"
          >
            Clear
          </button>
        </p>
      ) : null}

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

      <FormField label="Event Type" htmlFor={fieldId("eventType")} error={errors.eventType} errorId={errorId("eventType")}>
        <div className="relative">
          <select
            id={fieldId("eventType")}
            value={values.eventType}
            onChange={(e) => set("eventType")(e.target.value)}
            aria-invalid={!!errors.eventType}
            aria-describedby={describedBy("eventType")}
            className={cn(
              inputClass,
              "cursor-pointer appearance-none pr-10",
              !values.eventType && "text-muted",
              errors.eventType && "border-error"
            )}
          >
            <option value="">Select Event Type</option>
            {EVENT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="text-charcoal">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.5}
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-charcoal"
          />
        </div>
      </FormField>

      <FormField label="Preferred Date" htmlFor={fieldId("startDate")} error={errors.startDate} errorId={errorId("startDate")}>
        <OverlayInput
          icon={<CalendarDays aria-hidden="true" strokeWidth={1.5} className={iconClass} />}
          display={values.startDate ? formatDate(values.startDate) : "Select Date"}
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
            aria-invalid={!!errors.startDate}
            aria-describedby={describedBy("startDate")}
            className={overlayClass}
          />
        </OverlayInput>
      </FormField>

      <FormField
        label="Your Message"
        htmlFor={fieldId("message")}
        error={errors.message}
        errorId={errorId("message")}
        className="md:col-span-2"
      >
        <textarea
          id={fieldId("message")}
          rows={3}
          placeholder="Guests, ideas, anything we should know"
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={cn(inputClass, "h-auto min-h-24 resize-y py-2.5", errors.message && "border-error")}
        />
      </FormField>

      <Honeypot id={`${id}-website`} value={values.website} onChange={set("website")} />

      <div className="flex justify-end md:col-span-2">
        <Button
          type="submit"
          variant="primary"
          size="pill"
          shape="pill"
          disabled={sending}
          className="h-11 w-full disabled:opacity-70 md:w-auto md:min-w-48"
        >
          {sending ? null : <Send aria-hidden="true" strokeWidth={1.5} />}
          {sending ? "Sending…" : "Send Enquiry"}
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
              You can also call <PhoneLink phone={result.phone} source={SOURCE} />.
            </>
          ) : (
            "Please try again later."
          )}
        </p>
      ) : null}
    </form>
  )
}
