import { describe, expect, it } from "vitest"

import { readLogDraft, writeLogDraft } from "../log-draft"

function memoryStorage() {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    items,
  }
}

const draft = {
  values: { "recommended-routine-pull-up": "Negatives, 6/6/5" },
  performedOn: "2026-11-15",
  note: "Felt strong",
}

describe("log drafts", () => {
  it("restores an unsaved log for the same workout", () => {
    const storage = memoryStorage()

    writeLogDraft(storage, 141, draft)

    expect(readLogDraft(storage, 141)).toEqual(draft)
    expect(readLogDraft(storage, 142)).toBeNull()
  })

  it("removes the draft when the log is saved or cancelled", () => {
    const storage = memoryStorage()
    writeLogDraft(storage, 141, draft)

    writeLogDraft(storage, 141, null)

    expect(readLogDraft(storage, 141)).toBeNull()
    expect(storage.items.size).toBe(0)
  })

  it("ignores missing, corrupt, or foreign data", () => {
    const storage = memoryStorage()
    expect(readLogDraft(storage, 141)).toBeNull()

    storage.setItem("log-draft:141", "{not json")
    expect(readLogDraft(storage, 141)).toBeNull()

    storage.setItem("log-draft:141", JSON.stringify({ values: "x" }))
    expect(readLogDraft(storage, 141)).toBeNull()
  })

  it("keeps working when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied")
      },
      setItem: () => {
        throw new Error("quota")
      },
      removeItem: () => {
        throw new Error("denied")
      },
    }

    expect(readLogDraft(broken, 141)).toBeNull()
    expect(() => writeLogDraft(broken, 141, draft)).not.toThrow()
  })
})
