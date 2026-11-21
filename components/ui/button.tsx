import type { ComponentProps } from "react"
import Link from "next/link"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors duration-hover ease-soft select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Filled forest: "BOOK YOUR STAY →" */
        primary:
          "eyebrow rounded-md bg-forest text-ivory hover:bg-charcoal",
        /** Filled gold: "EXPLORE DESTINATIONS →" */
        accent:
          "eyebrow rounded-md bg-gold text-white hover:bg-forest",
        /** Forest outline: "DISCOVER MORE →" */
        outline:
          "eyebrow rounded-md border border-forest text-forest hover:bg-forest hover:text-ivory",
        /** Small secondary outline: "Secondary" */
        secondary:
          "rounded-md border border-forest text-small text-forest hover:bg-forest hover:text-ivory",
        /** Text link with arrow: "Learn More →" */
        link: "text-small font-bold text-charcoal hover:text-forest",
        /** Round icon button */
        icon: "rounded-full bg-forest text-ivory hover:bg-gold",
      },
      size: {
        default: "h-12 px-8 [&_svg]:size-4",
        sm: "h-8 px-5 [&_svg]:size-3.5",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    compoundVariants: [
      { variant: "link", class: "h-auto px-0" },
      { variant: "secondary", size: "default", class: "h-8 px-5" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type VariantOptions = VariantProps<typeof buttonVariants> & {
  /** Append the brand arrow (→) that nudges right on hover. */
  arrow?: boolean
}

function ArrowIcon() {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
    />
  )
}

function Button({
  className,
  variant,
  size,
  arrow = false,
  children,
  ...props
}: ButtonPrimitive.Props & VariantOptions) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {arrow ? <ArrowIcon /> : null}
    </ButtonPrimitive>
  )
}

/** Same styles as Button, rendered as a Next.js link for navigation CTAs. */
function ButtonLink({
  className,
  variant,
  size,
  arrow = false,
  children,
  ...props
}: ComponentProps<typeof Link> & VariantOptions) {
  return (
    <Link
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {arrow ? <ArrowIcon /> : null}
    </Link>
  )
}

export { Button, ButtonLink, buttonVariants }
