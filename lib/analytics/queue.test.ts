import { describe, expect, it } from "vitest"

import { createEventQueue } from "./queue"

describe("createEventQueue", () => {
  it("drains in order and empties", () => {
    const q = createEventQueue()
    q.push({ event: "a", props: {} })
    q.push({ event: "b", props: { x: 1 } })
    expect(q.drain().map((e) => e.event)).toEqual(["a", "b"])
    expect(q.size).toBe(0)
    expect(q.drain()).toEqual([])
  })

  it("drops events past the cap", () => {
    const q = createEventQueue(2)
    q.push({ event: "a", props: {} })
    q.push({ event: "b", props: {} })
    q.push({ event: "c", props: {} })
    expect(q.drain().map((e) => e.event)).toEqual(["a", "b"])
  })

  it("clears", () => {
    const q = createEventQueue()
    q.push({ event: "a", props: {} })
    q.clear()
    expect(q.size).toBe(0)
  })
})
