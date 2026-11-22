import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

const posthogLogProvider =
  process.env.NEXT_RUNTIME === "nodejs" && token && host
    ? new LoggerProvider({
        resource: resourceFromAttributes({ "service.name": "kuriftu-resorts-spa" }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: `${host.replace(/\/$/, "")}/i/v1/logs`,
              timeoutMillis: 2000,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }),
          }),
        ],
      })
    : undefined

export const posthogLogger = posthogLogProvider?.getLogger("posthog-log-export")

export async function flushPostHogLogs() {
  await posthogLogProvider?.forceFlush().catch(() => {})
}

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || posthogLogProvider) return

  if (process.env.NODE_ENV !== "production") {
    const missingVariable = token
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
    console.warn(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    )
  }
}
