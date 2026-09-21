"use client"

import { format, parseISO } from "date-fns"
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { ProgramWorkoutCard } from "@/components/program-workout-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

import fetcher from "@/lib/fetcher"
import { getRecordPrompts } from "@/lib/program-workout-recording"
import type {
  ProgramExercise,
  SessionRecord,
  SessionRecordField,
  WorkoutSection,
} from "@/lib/types"

type RecordResponse = {
  records: SessionRecord[]
  latestValues: Record<string, string>
}

type Props = {
  workoutId: number
  content: WorkoutSection[]
  videoUrl: string | null
  archived?: boolean
}

function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function recordFields(prompts: SessionRecordField[], record: SessionRecord) {
  const fields = new Map(prompts.map((field) => [field.id, field]))
  for (const entry of record.entries) {
    if (!fields.has(entry.fieldId)) {
      fields.set(entry.fieldId, { id: entry.fieldId, label: entry.label })
    }
  }
  return [...fields.values()]
}

function valuesForRecord(record: SessionRecord) {
  return Object.fromEntries(
    record.entries.map((entry) => [entry.fieldId, entry.value]),
  )
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string
  } | null
  return body?.error || "Could not save the workout"
}

export function ProgramSessionRecords({
  workoutId,
  content,
  videoUrl,
  archived = false,
}: Props) {
  const prompts = useMemo(() => getRecordPrompts(content), [content])
  const { data, error, isLoading, mutate } = useSWR<RecordResponse>(
    `/api/session-records/${workoutId}`,
    fetcher,
  )
  const [isLogging, setIsLogging] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [performedOn, setPerformedOn] = useState(today)
  const [note, setNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [editPerformedOn, setEditPerformedOn] = useState("")
  const [editNote, setEditNote] = useState("")
  const [expandedRecords, setExpandedRecords] = useState<
    Record<number, boolean>
  >({})

  function resetLog() {
    setIsLogging(false)
    setValues({})
    setPerformedOn(today())
    setNote("")
  }

  async function saveNewRecord() {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/session-records/${workoutId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performedOn,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
          entries: prompts.map((prompt) => ({
            fieldId: prompt.id,
            value: values[prompt.id] ?? "",
          })),
          note,
        }),
      })
      if (!response.ok) throw new Error(await readError(response))
      await mutate()
      resetLog()
      toast.success("Session recorded")
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the session record",
      )
    } finally {
      setIsSaving(false)
    }
  }

  function beginEdit(record: SessionRecord) {
    setEditingId(record.id)
    setEditValues(valuesForRecord(record))
    setEditPerformedOn(record.performedOn)
    setEditNote(record.note ?? "")
  }

  async function saveEdit(record: SessionRecord) {
    setIsSaving(true)
    try {
      const response = await fetch(
        `/api/session-records/${workoutId}/${record.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            performedOn: editPerformedOn,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            entries: recordFields(prompts, record).map((field) => ({
              fieldId: field.id,
              value: editValues[field.id] ?? "",
            })),
            note: editNote,
          }),
        },
      )
      if (!response.ok) throw new Error(await readError(response))
      await mutate()
      setEditingId(null)
      toast.success("Session record updated")
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Could not update the session record",
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteRecord(recordId: number) {
    const response = await fetch(
      `/api/session-records/${workoutId}/${recordId}`,
      { method: "DELETE" },
    )
    if (!response.ok) {
      toast.error("Could not delete the session record")
      return
    }
    await mutate()
    toast.success("Session record deleted")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Workout</h2>
            {archived && (
              <p className="text-xs text-muted-foreground">
                This workout is archived. Your history remains available.
              </p>
            )}
          </div>
          {!archived && !isLogging && (
            <Button onClick={() => setIsLogging(true)}>
              <Plus />
              Log workout
            </Button>
          )}
        </div>

        <ProgramWorkoutCard
          title={null}
          content={content}
          videoUrl={videoUrl}
          exerciseAddon={(exercise: ProgramExercise) => {
            const prompt = exercise.recordPrompt
            if (!prompt) return null
            const previous = data?.latestValues[exercise.id]

            return (
              <div className="mt-1.5 space-y-1.5 border-l border-border pl-3">
                {isLogging && (
                  <>
                    <Label
                      htmlFor={`record-${exercise.id}`}
                      className={
                        prompt.label === exercise.name ? "sr-only" : undefined
                      }
                    >
                      {prompt.label}
                    </Label>
                    <Input
                      id={`record-${exercise.id}`}
                      value={values[exercise.id] ?? ""}
                      placeholder={prompt.placeholder || "Optional result"}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [exercise.id]: event.target.value,
                        }))
                      }
                    />
                  </>
                )}
                {previous && (
                  <p className="text-xs text-muted-foreground">
                    Previous: {previous}
                  </p>
                )}
              </div>
            )
          }}
        />

        {isLogging && (
          <div className="space-y-3 border border-border/50 bg-card/50 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="performed-on">Performed on</Label>
              <Input
                id="performed-on"
                type="date"
                max={today()}
                value={performedOn}
                onChange={(event) => setPerformedOn(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-note">Session note</Label>
              <Textarea
                id="session-note"
                value={note}
                placeholder="Optional note about the full workout"
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetLog} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={saveNewRecord} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save session"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Workout history</h2>
        {isLoading && <Skeleton className="h-24" />}
        {error && (
          <p className="text-xs text-destructive">
            Workout history could not be loaded.
          </p>
        )}
        {!isLoading && !error && data?.records.length === 0 && (
          <p className="border border-dashed border-border p-4 text-xs text-muted-foreground">
            No session records yet.
          </p>
        )}
        <div className="space-y-2">
          {data?.records.map((record, index) => (
            <details
              key={record.id}
              open={expandedRecords[record.id] ?? index === 0}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open
                setExpandedRecords((current) =>
                  current[record.id] === isOpen
                    ? current
                    : { ...current, [record.id]: isOpen },
                )
              }}
              className="group border border-border/50 bg-card/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span>
                  {format(parseISO(record.performedOn), "d MMMM yyyy")}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-border/50 p-4">
                {editingId === record.id ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor={`edit-date-${record.id}`}>
                        Performed on
                      </Label>
                      <Input
                        id={`edit-date-${record.id}`}
                        type="date"
                        max={today()}
                        value={editPerformedOn}
                        onChange={(event) =>
                          setEditPerformedOn(event.target.value)
                        }
                      />
                    </div>
                    {recordFields(prompts, record).map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={`edit-${record.id}-${field.id}`}>
                          {field.label}
                        </Label>
                        <Input
                          id={`edit-${record.id}-${field.id}`}
                          value={editValues[field.id] ?? ""}
                          placeholder={field.placeholder || "Optional result"}
                          onChange={(event) =>
                            setEditValues((current) => ({
                              ...current,
                              [field.id]: event.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <Label htmlFor={`edit-note-${record.id}`}>
                        Session note
                      </Label>
                      <Textarea
                        id={`edit-note-${record.id}`}
                        value={editNote}
                        onChange={(event) => setEditNote(event.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => saveEdit(record)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {record.entries.length > 0 && (
                      <dl className="space-y-2">
                        {record.entries.map((entry) => (
                          <div key={entry.fieldId}>
                            <dt className="text-xs text-muted-foreground">
                              {entry.label}
                            </dt>
                            <dd className="text-sm">{entry.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {record.note && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Session note
                        </p>
                        <p className="whitespace-pre-wrap text-sm">
                          {record.note}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => beginEdit(record)}
                      >
                        <Pencil />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button size="sm" variant="destructive">
                              <Trash2 />
                              Delete
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete session record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the saved results and session note.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteRecord(record.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
