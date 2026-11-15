import { describe, expect, it } from "vitest"

import { readStoredEntries, storableEntries } from "./swr-cache-provider"

describe("SWR cache persistence", () => {
  it("stores only API responses that have data", () => {
    const cache = new Map<string, { data?: unknown; error?: unknown }>([
      ["/api/programs", { data: [{ id: 3 }] }],
      ["/api/programs/3", { error: new Error("offline") }],
      ["$inf$/api/other", { data: 1 }],
    ])

    expect(storableEntries(cache as never)).toEqual([
      ["/api/programs", [{ id: 3 }]],
    ])
  })

  it("reads stored entries and ignores missing or corrupt storage", () => {
    const storage = (value: string | null) => ({ getItem: () => value })

    expect(readStoredEntries(storage('[["/api/programs",[1]]]'))).toEqual([
      ["/api/programs", [1]],
    ])
    expect(readStoredEntries(storage(null))).toEqual([])
    expect(readStoredEntries(storage("{not json"))).toEqual([])
    expect(readStoredEntries(storage('{"a":1}'))).toEqual([])
  })
})
