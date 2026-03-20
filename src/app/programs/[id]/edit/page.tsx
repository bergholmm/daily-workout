"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ProgramForm } from "@/components/program-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { useProgram } from "@/lib/hooks/use-programs"

export default function EditProgramPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const programId = Number(params.id)
  const { program, isLoading, mutate } = useProgram(programId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSubmit(data: {
    name: string
    description: string | null
  }) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success("Program updated")
      mutate()
      router.push(`/programs/${programId}`)
    } catch {
      toast.error("Failed to update program")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this program and all its workouts?",
      )
    )
      return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Program deleted")
      router.push("/programs")
    } catch {
      toast.error("Failed to delete program")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
        <p>Program not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
      <h1 className="text-3xl font-bold">Edit Program</h1>
      <ProgramForm
        initial={{ name: program.name, description: program.description }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Program"
      />
      <div className="border-t pt-4">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Program"}
        </Button>
      </div>
    </div>
  )
}
