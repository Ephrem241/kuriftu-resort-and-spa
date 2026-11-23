"use client"

import { useId, useRef, useState, type FormEvent } from "react"
import { ArrowRight, ChevronDown, Mail, Phone as PhoneIcon } from "lucide-react"

import { FormField, Honeypot, PhoneLink, iconClass, inputClass, postEnquiry, type Phone } from "@/components/forms/form-parts"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { todayInResortZone } from "@/lib/booking/dates"
import { createEnquirySchema, fieldErrors } from "@/lib/enquiry/schema"
import { cn } from "@/lib/utils"

type FormProps = {
  resorts: { slug: string; heading: string }[]
  /** Site reservations, shown when the server can't name a better number. */
  reservationPhone: Phone | null
}

type Field = "name" | "email" | "phone" | "resort" | "message"
type Errors = Partial<Record<Field | "form", string>>
type Values = Record<Field, string> & { website: string }

type Result =
  | { status: "sent"; emailSent: boolean; phone: Phone | null }
  | { status: "failed"; message: string; phone: Phone | null }

const FIELDS: Field[] = ["name", "email", "phone", "resort", "message"]
const SOURCE = "contact"

/** The general contact form: validated here for feedback, by /api/enquiry for real. */
export function ContactForm({ resorts, reservationPhone }: FormProps) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", resort: "", message: "", website: "" })
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

    const { resort, ...rest } = values
    const payload = { type: "contact" as const, ...rest, ...(resort ? { resort } : {}) }
    const parsed = createEnquirySchema({ today: todayInResortZone() }).safeParse(payload)
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
      track("enquiry_submitted", { type: "contact" })
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
        <p className="text-body text-charcoal">Your message is with our team. We will get back to you soon.</p>
        {!result.emailSent && result.phone ? (
          <p className="text-small text-charcoal">
            If you don&apos;t hear from us, call <PhoneLink phone={result.phone} source={SOURCE} />.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-label="Contact form" className="grid gap-x-4 gap-y-4 md:grid-cols-2 md:gap-x-5">
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

      <FormField label="Email" required htmlFor={fieldId("email")} error={errors.email} errorId={errorId("email")}>
        <div className="relative">
          <Mail aria-hidden="true" strokeWidth={1.5} className={iconClass} />
          <input
            id={fieldId("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={cn(inputClass, "pl-10", errors.email && "border-error")}
          />
        </div>
      </FormField>

      <FormField label="Phone Number" htmlFor={fieldId("phone")} error={errors.phone} errorId={errorId("phone")}>
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
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={cn(inputClass, "pl-10", errors.phone && "border-error")}
          />
        </div>
      </FormField>

      <FormField label="Resort" htmlFor={fieldId("resort")} error={errors.resort} errorId={errorId("resort")}>
        <div className="relative">
          <select
            id={fieldId("resort")}
            value={values.resort}
            onChange={(e) => set("resort")(e.target.value)}
            aria-invalid={!!errors.resort}
            aria-describedby={describedBy("resort")}
            className={cn(inputClass, "cursor-pointer appearance-none pr-10", errors.resort && "border-error")}
          >
            <option value="">Any / general enquiry</option>
            {resorts.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.heading}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-charcoal" />
        </div>
      </FormField>

      <FormField
        label="Message"
        required
        htmlFor={fieldId("message")}
        error={errors.message}
        errorId={errorId("message")}
        className="md:col-span-2"
      >
        <textarea
          id={fieldId("message")}
          rows={4}
          placeholder="How can we help?"
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={cn(inputClass, "h-auto min-h-28 resize-y py-2.5", errors.message && "border-error")}
        />
      </FormField>

      <Honeypot id={`${id}-website`} value={values.website} onChange={set("website")} />

      <div className="md:col-span-2">
        <Button type="submit" variant="primary" size="pill" shape="pill" disabled={sending} className="h-11 w-full disabled:opacity-70">
          {sending ? "Sending…" : "Send Message"}
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
              Please call <PhoneLink phone={result.phone} source={SOURCE} />.
            </>
          ) : (
            "Please try again later."
          )}
        </p>
      ) : null}
    </form>
  )
}
