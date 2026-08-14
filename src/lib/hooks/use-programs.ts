import useSWR from "swr"
import useSWRMutation from "swr/mutation"

import type { WorkoutSection } from "@/lib/types"

import fetcher from "../fetcher"

type Program = {
  id: number
  name: string
  slug: string | null
  description: string | null
  isPublic: boolean
  startDate: string | null
  durationWeeks: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

type ProgramWorkout = {
  id: number
  programId: number
  date: string
  title: string | null
  summary: string | null
  content: WorkoutSection[]
  videoUrl: string | null
  status: "draft" | "scheduled" | "published"
  publishAt: string | null
  publicationKey: string | null
  weekNumber: number | null
  emphasisNumber: number | null
  durationMinutes: number | null
  focus: string[]
  equipment: string[]
  createdAt: string
  updatedAt: string
}

async function postJSON<T>(url: string, { arg }: { arg: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<T>
}

export function usePrograms() {
  const res = useSWR<Program[]>("/api/programs", fetcher)
  const create = useSWRMutation("/api/programs", postJSON<Program>)

  return {
    programs: res.data,
    isLoading: res.isLoading,
    error: res.error,
    createProgram: create.trigger,
    isCreating: create.isMutating,
    mutate: res.mutate,
  }
}

export function useProgram(id: number | null) {
  const res = useSWR<Program>(id ? `/api/programs/${id}` : null, fetcher)

  return {
    program: res.data,
    isLoading: res.isLoading,
    error: res.error,
    mutate: res.mutate,
  }
}

export function useProgramWorkouts(programId: number | null) {
  const res = useSWR<ProgramWorkout[]>(
    programId ? `/api/programs/${programId}/workouts` : null,
    fetcher,
  )
  const create = useSWRMutation(
    programId ? `/api/programs/${programId}/workouts` : null,
    postJSON<ProgramWorkout>,
  )

  return {
    workouts: res.data,
    isLoading: res.isLoading,
    error: res.error,
    createWorkout: create.trigger,
    isCreating: create.isMutating,
    mutate: res.mutate,
  }
}
