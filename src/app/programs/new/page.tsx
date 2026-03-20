"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProgramForm } from "@/components/program-form"

import { usePrograms } from "@/lib/hooks/use-programs"

export default function NewProgramPage() {
  const router = useRouter()
  const { createProgram, isCreating } = usePrograms()

  async function handleSubmit(data: {
    name: string
    description: string | null
  }) {
    try {
      const program = await createProgram(data)
      toast.success("Program created")
      router.push(`/programs/${program?.id}`)
    } catch {
      toast.error("Failed to create program")
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
      <h1 className="text-3xl font-bold">New Program</h1>
      <ProgramForm
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        submitLabel="Create Program"
      />
    </div>
  )
}
