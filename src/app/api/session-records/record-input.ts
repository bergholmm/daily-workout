import { getRecordPrompts } from "@/lib/program-workout-recording"
import type { SessionRecordEntry, WorkoutSection } from "@/lib/types"
import { unrestrictedSessionRecordSchema } from "@/lib/validators"

type ParsedRecordInput = {
  performedOn: string
  entries: SessionRecordEntry[]
  note: string | null
}

export function parseUnrestrictedRecordInput(
  body: unknown,
  content: WorkoutSection[],
  today?: string,
  historicalEntries: SessionRecordEntry[] = [],
):
  | { data: ParsedRecordInput; error?: never }
  | { data?: never; error: string } {
  const parsed = unrestrictedSessionRecordSchema.safeParse(body)
  if (!parsed.success) return { error: parsed.error.message }

  const timezoneOffsetMinutes = parsed.data.timezoneOffsetMinutes ?? 0
  const referenceDate =
    today ??
    new Date(Date.now() - timezoneOffsetMinutes * 60_000)
      .toISOString()
      .slice(0, 10)
  if (parsed.data.performedOn > referenceDate) {
    return { error: "Performed date cannot be in the future" }
  }

  const fields = getRecordPrompts(content)
  const fieldsById = new Map(fields.map((field) => [field.id, field]))
  for (const entry of historicalEntries) {
    fieldsById.set(entry.fieldId, {
      id: entry.fieldId,
      label: entry.label,
    })
  }
  const submittedIds = new Set(
    parsed.data.entries.map((entry) => entry.fieldId),
  )
  const fieldsMatch =
    submittedIds.size === parsed.data.entries.length &&
    parsed.data.entries.every((entry) => fieldsById.has(entry.fieldId))
  if (!fieldsMatch) {
    return { error: "Record prompts do not match this workout" }
  }

  const entries = parsed.data.entries
    .filter((entry) => entry.value.trim())
    .map((entry) => ({
      fieldId: entry.fieldId,
      label: fieldsById.get(entry.fieldId)!.label,
      value: entry.value.trim(),
    }))
  const note = parsed.data.note?.trim() || null
  if (entries.length === 0 && !note) {
    return { error: "Enter an exercise result or session note" }
  }

  return {
    data: {
      performedOn: parsed.data.performedOn,
      entries,
      note,
    },
  }
}
