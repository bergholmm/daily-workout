"use client"

import { ArrowLeft, Ellipsis, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProgramWorkoutCard } from "@/components/program-workout-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

import { useProgram, useProgramWorkouts } from "@/lib/hooks/use-programs"

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string; workoutId: string }>()
  const router = useRouter()
  const programId = Number(params.id)
  const workoutId = Number(params.workoutId)
  const { program } = useProgram(programId)
  const { workouts, isLoading, mutate } = useProgramWorkouts(programId)
  const workout = workouts?.find((w) => w.id === workoutId)

  async function handleDelete() {
    try {
      const res = await fetch(
        `/api/programs/${programId}/workouts/${workoutId}`,
        { method: "DELETE" },
      )
      if (!res.ok) throw new Error()
      toast.success("Workout deleted")
      mutate()
      router.push(`/programs/${programId}`)
    } catch {
      toast.error("Failed to delete workout")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
        <p className="text-muted-foreground">Workout not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href={`/programs/${programId}`}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {program?.name ?? "Back"}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
              />
            }
          >
            <Ellipsis className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete workout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {workout.title ?? workout.date}
        </h1>
        {workout.title && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {workout.date}
          </p>
        )}
      </div>

      <ProgramWorkoutCard
        title={null}
        content={workout.content}
        videoUrl={workout.videoUrl}
      />
    </div>
  )
}
