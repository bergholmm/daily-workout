"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ProgramForm } from "@/components/program-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
        <p className="text-muted-foreground">Program not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <Link
        href={`/programs/${programId}`}
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back
      </Link>

      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Edit
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {program.name}
        </h1>
      </div>

      <ProgramForm
        initial={{ name: program.name, description: program.description }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update Program"
      />

      <Separator />

      <div>
        <p className="mb-3 text-xs font-medium text-destructive">Danger Zone</p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Program"}
        </Button>
      </div>
    </div>
  )
}
