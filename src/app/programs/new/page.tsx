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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Create
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">New Program</h1>
      </div>
      <ProgramForm
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        submitLabel="Create Program"
      />
    </div>
  )
}
