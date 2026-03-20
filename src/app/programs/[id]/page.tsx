"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ProgramWorkoutCard } from "@/components/program-workout-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkoutForm } from "@/components/workout-form"

import { useProgram, useProgramWorkouts } from "@/lib/hooks/use-programs"

export default function ProgramPage() {
  const params = useParams<{ id: string }>()
  const programId = Number(params.id)
  const { program, isLoading: programLoading } = useProgram(programId)
  const {
    workouts,
    isLoading: workoutsLoading,
    createWorkout,
    isCreating,
    mutate,
  } = useProgramWorkouts(programId)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleAddWorkout(data: {
    date: string
    title: string | null
    content: string[]
    videoUrl: string | null
  }) {
    try {
      await createWorkout(data)
      toast.success("Workout added")
      setDialogOpen(false)
      mutate()
    } catch {
      toast.error("Failed to add workout")
    }
  }

  async function handleDeleteWorkout(workoutId: number) {
    try {
      const res = await fetch(
        `/api/programs/${programId}/workouts/${workoutId}`,
        {
          method: "DELETE",
        },
      )
      if (!res.ok) throw new Error()
      toast.success("Workout deleted")
      mutate()
    } catch {
      toast.error("Failed to delete workout")
    }
  }

  if (programLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{program.name}</h1>
          {program.description && (
            <p className="mt-1 text-muted-foreground">{program.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/programs/${programId}/edit`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Workout</DialogTitle>
              </DialogHeader>
              <WorkoutForm
                onSubmit={handleAddWorkout}
                isSubmitting={isCreating}
                submitLabel="Add Workout"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {workoutsLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[150px] rounded-xl" />
          <Skeleton className="h-[150px] rounded-xl" />
        </div>
      )}

      {workouts?.length === 0 && (
        <p className="text-muted-foreground">
          No workouts yet. Add one to get started.
        </p>
      )}

      <div className="space-y-4">
        {workouts?.map((w) => (
          <div key={w.id} className="relative">
            <div className="absolute right-2 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteWorkout(w.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ProgramWorkoutCard
              title={w.title ? `${w.date} — ${w.title}` : w.date}
              content={w.content}
              videoUrl={w.videoUrl}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
