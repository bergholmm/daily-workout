// An unsaved workout log, kept on the device so a reload never loses it.
export type LogDraft = {
  values: Record<string, string>
  performedOn: string
  note: string
}

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">

function storageKey(workoutId: number) {
  return `log-draft:${workoutId}`
}

function isLogDraft(value: unknown): value is LogDraft {
  if (typeof value !== "object" || value === null) return false
  const draft = value as Record<string, unknown>
  return (
    typeof draft.values === "object" &&
    draft.values !== null &&
    Object.values(draft.values).every((item) => typeof item === "string") &&
    typeof draft.performedOn === "string" &&
    typeof draft.note === "string"
  )
}

export function readLogDraft(storage: DraftStorage, workoutId: number) {
  try {
    const draft: unknown = JSON.parse(
      storage.getItem(storageKey(workoutId)) ?? "null",
    )
    return isLogDraft(draft) ? draft : null
  } catch {
    return null
  }
}

export function writeLogDraft(
  storage: DraftStorage,
  workoutId: number,
  draft: LogDraft | null,
) {
  try {
    if (draft) storage.setItem(storageKey(workoutId), JSON.stringify(draft))
    else storage.removeItem(storageKey(workoutId))
  } catch {
    // Storage can be full or disabled; the log still works in memory.
  }
}
