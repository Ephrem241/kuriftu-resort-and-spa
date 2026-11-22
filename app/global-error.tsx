'use client'

import NextError from 'next/error'
import { useEffect } from 'react'

import { captureException } from '@/lib/analytics/posthog'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // A no-op unless the guest consented and PostHog is loaded.
    captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
