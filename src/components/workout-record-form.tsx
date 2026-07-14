"use client"

import { SignInButton, useAuth } from "@clerk/nextjs"
import { Check, LoaderCircle, LogIn, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import fetcher from "@/lib/fetcher"
import type { TrainingRecord } from "@/lib/types"

type Props = {
  workoutId: number
  prompts: string[]
}

type RecordFieldsProps = Props & {
  record: TrainingRecord | null
  onSaved: (record: TrainingRecord) => Promise<unknown>
}

function RecordFields({
  workoutId,
  prompts,
  record,
  onSaved,
}: RecordFieldsProps) {
  const savedEntries = new Map(
    record?.entries.map((entry) => [entry.prompt, entry.value]) ?? [],
  )
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      prompts.map((prompt) => [prompt, savedEntries.get(prompt) ?? ""]),
    ),
  )
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = prompts.some(
    (prompt) => values[prompt] !== (savedEntries.get(prompt) ?? ""),
  )
  const hasValue = prompts.some((prompt) => values[prompt]?.trim())
  const canSave = isDirty && (record !== null || hasValue)

  async function saveRecord() {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/training-records/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: prompts.map((prompt) => ({
            prompt,
            value: values[prompt] ?? "",
          })),
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Failed to save training record")
      }

      const saved = (await response.json()) as TrainingRecord
      await onSaved(saved)
      toast.success(record ? "Training record updated" : "Training recorded")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save training record",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {prompts.map((prompt, index) => {
        const inputId = `training-record-${workoutId}-${index}`

        return (
          <div key={prompt} className="space-y-1.5">
            <label
              htmlFor={inputId}
              className="block text-xs leading-relaxed text-foreground/75"
            >
              {prompt}
            </label>
            <Input
              id={inputId}
              value={values[prompt] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [prompt]: event.target.value,
                }))
              }
              placeholder="Enter result"
              autoComplete="off"
            />
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

function SignedInRecordForm({ workoutId, prompts }: Props) {
  const { data, error, isLoading, mutate } = useSWR<TrainingRecord | null>(
    `/api/training-records/${workoutId}`,
    fetcher,
  )

  if (isLoading || data === undefined) {
    return (
      <div className="mt-4 space-y-3" aria-label="Loading training record">
        {prompts.map((prompt) => (
          <div key={prompt} className="space-y-1.5">
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
      key={`${workoutId}-${data?.updatedAt ?? "new"}`}
      workoutId={workoutId}
      prompts={prompts}
      record={data}
      onSaved={(saved) => mutate(saved, { revalidate: false })}
    />
  )
}

export function WorkoutRecordForm({ workoutId, prompts }: Props) {
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

  return <SignedInRecordForm workoutId={workoutId} prompts={prompts} />
}
