"use client"

import {
  ArrowLeft,
  Dumbbell,
  Ellipsis,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkoutForm } from "@/components/workout-form"

import { useProgram, useProgramWorkouts } from "@/lib/hooks/use-programs"
import type { WorkoutSection } from "@/lib/types"

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
    content: WorkoutSection[]
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
        { method: "DELETE" },
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
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
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
      {/* Back link */}
      <Link
        href="/programs"
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Programs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
          {program.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {program.description}
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/programs/${programId}/edit`} />}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <ResponsiveDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            }
            title="Add Workout"
          >
            <WorkoutForm
              onSubmit={handleAddWorkout}
              isSubmitting={isCreating}
              submitLabel="Add Workout"
            />
          </ResponsiveDialog>
        </div>
      </div>

      {/* Workouts list */}
      {workoutsLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

      {workouts?.length === 0 && (
        <Empty className="h-32 border border-dashed border-border/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Dumbbell />
            </EmptyMedia>
            <EmptyTitle>No workouts yet</EmptyTitle>
            <EmptyDescription>Add one to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="space-y-2">
        {workouts?.map((w) => (
          <div
            key={w.id}
            className="flex items-center border border-border/50 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card"
          >
            <Link
              href={`/programs/${programId}/workouts/${w.id}`}
              className="flex flex-1 items-center justify-between px-4 py-3"
            >
              <div>
                <h3 className="text-sm font-semibold">
                  {w.title ? `${w.title}` : w.date}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {w.title ? w.date + " · " : ""}
                  {w.content.length}{" "}
                  {w.content.length === 1 ? "section" : "sections"}
                </p>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="mr-2 text-muted-foreground"
                  />
                }
              >
                <Ellipsis className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteWorkout(w.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}
