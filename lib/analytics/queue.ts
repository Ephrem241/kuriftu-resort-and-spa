/** A bounded FIFO for events fired after consent but before PostHog loads. */
export type QueuedEvent = { event: string; props: Record<string, unknown> }

export function createEventQueue(cap = 20) {
  let items: QueuedEvent[] = []
  return {
    push(item: QueuedEvent): void {
      if (items.length >= cap) return
      items.push(item)
    },
    drain(): QueuedEvent[] {
      const out = items
      items = []
      return out
    },
    clear(): void {
      items = []
    },
    get size(): number {
      return items.length
    },
  }
}
