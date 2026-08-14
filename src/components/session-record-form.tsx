"use client"

import { SignInButton, useAuth } from "@clerk/nextjs"
import { Check, LoaderCircle, LogIn, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { findPreviousSessionValue } from "@/lib/built-to-move-program"
import fetcher from "@/lib/fetcher"
import type { SessionRecord, SessionRecordField } from "@/lib/types"

type Props = {
  workoutId: number
  weekNumber: number
  fields: SessionRecordField[]
}

type RecordResponse = {
  record: SessionRecord | null
  previousRecord: SessionRecord | null
}

type RecordFieldsProps = Props &
  RecordResponse & {
    onSaved: (record: SessionRecord) => Promise<unknown>
  }

function RecordFields({
  workoutId,
  weekNumber,
  fields,
  record,
  previousRecord,
  onSaved,
}: RecordFieldsProps) {
  const savedEntries = new Map(
    record?.entries.map((entry) => [entry.fieldId, entry.value]) ?? [],
  )
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.id, savedEntries.get(field.id) ?? ""]),
    ),
  )
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = fields.some(
    (field) => values[field.id] !== (savedEntries.get(field.id) ?? ""),
  )
  const hasValue = fields.some((field) => values[field.id]?.trim())
  const canSave = isDirty && (record !== null || hasValue)

  async function saveRecord() {
    setIsSaving(true)

    try {
      const response = await fetch(
        `/api/session-records/${workoutId}?week=${weekNumber}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entries: fields.map((field) => ({
              fieldId: field.id,
              value: values[field.id] ?? "",
            })),
          }),
        },
      )

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Failed to save session record")
      }

      const saved = (await response.json()) as SessionRecord
      await onSaved(saved)
      toast.success(record ? "Session record updated" : "Session recorded")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save session record",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {fields.map((field) => {
        const inputId = `session-record-${workoutId}-${field.id}`
        const previousValue = findPreviousSessionValue(
          field,
          previousRecord?.entries ?? [],
        )

        return (
          <div key={field.id} className="space-y-1.5">
            <label
              htmlFor={inputId}
              className="block text-xs leading-relaxed text-foreground/75"
            >
              {field.label}
            </label>
            <Input
              id={inputId}
              value={values[field.id] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.id]: event.target.value,
                }))
              }
              placeholder={field.placeholder ?? "Enter result"}
              autoComplete="off"
            />
            {previousValue && !record && (
              <p className="text-[11px] text-muted-foreground">
                Week {previousRecord?.weekNumber}: {previousValue}
              </p>
            )}
          </div>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {record && !isDirty ? (
            <>
              <Check className="h-3 w-3 text-primary" />
              Saved to your account
            </>
          ) : isDirty ? (
            "Unsaved changes"
          ) : (
            "Private to your account"
          )}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={saveRecord}
          disabled={!canSave || isSaving}
        >
          {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
          {record ? "Update record" : "Save record"}
        </Button>
      </div>
    </div>
  )
}

function SignedInRecordForm({ workoutId, weekNumber, fields }: Props) {
  const { data, error, isLoading, mutate } = useSWR<RecordResponse>(
    `/api/session-records/${workoutId}?week=${weekNumber}`,
    fetcher,
  )

  if (isLoading || data === undefined) {
    return (
      <div className="mt-4 space-y-3" aria-label="Loading session record">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <div className="h-3 w-2/3 animate-pulse bg-muted" />
            <div className="h-8 animate-pulse bg-muted/60" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 space-y-3 text-xs text-muted-foreground">
        <p>Could not load your saved record.</p>
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <RecordFields
      key={`${workoutId}-${data.record?.updatedAt ?? "new"}`}
      workoutId={workoutId}
      weekNumber={weekNumber}
      fields={fields}
      record={data.record}
      previousRecord={data.previousRecord}
      onSaved={(saved) =>
        mutate({ ...data, record: saved }, { revalidate: false })
      }
    />
  )
}

export function SessionRecordForm({ workoutId, weekNumber, fields }: Props) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <div className="mt-4 h-20 animate-pulse bg-muted/40" />
  }

  if (!isSignedIn) {
    return (
      <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>Sign in to save these results privately and find them here later.</p>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            <LogIn />
            Sign in to record
          </Button>
        </SignInButton>
      </div>
    )
  }

  return (
    <SignedInRecordForm
      workoutId={workoutId}
      weekNumber={weekNumber}
      fields={fields}
    />
  )
}
