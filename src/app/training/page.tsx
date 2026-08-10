import { auth } from "@clerk/nextjs/server"
import {
  ArrowRight,
  Check,
  Clock3,
  Dumbbell,
  Gauge,
  Layers3,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import {
  getPublicProgramBySlug,
  listVisibleProgramWorkouts,
} from "@/server/db/programs"
import { listRecordedWorkoutIds } from "@/server/db/training-records"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import {
  CAPABLE_PHASES,
  CAPABLE_PROGRAM_SLUG,
  CAPABLE_SESSIONS,
  getCapableWorkoutHref,
} from "@/lib/capable-program"
import type { PublicProgramWorkout } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "CAPABLE · Strength, Flexibility & Longevity",
  description:
    "A self-paced 12-week program built around Lower, Upper, and Conditioning sessions.",
}

function WorkoutLink({
  workout,
  completed,
  isNext,
}: {
  workout: PublicProgramWorkout
  completed: boolean
  isNext: boolean
}) {
  const session = CAPABLE_SESSIONS.find(
    (item) => item.number === workout.sessionNumber,
  )

  return (
    <Link
      href={getCapableWorkoutHref(
        workout.weekNumber ?? 1,
        workout.sessionNumber ?? 1,
      )}
      className={`group flex min-h-40 flex-col border p-4 transition-colors ${
        isNext
          ? "border-primary/50 bg-primary/[0.07] hover:bg-primary/[0.1]"
          : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary">
          {session?.name ?? `Session ${workout.sessionNumber}`}
        </p>
        {completed ? (
          <Badge variant="secondary">
            <Check data-icon="inline-start" />
            Recorded
          </Badge>
        ) : isNext ? (
          <Badge>Up next</Badge>
        ) : null}
      </div>

      <h4 className="mt-3 text-sm font-semibold leading-snug">
        {workout.title}
      </h4>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {workout.summary}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          {workout.durationMinutes} min
        </span>
        <span className="flex items-center gap-1 text-primary transition-transform group-hover:translate-x-0.5">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export default async function TrainingPage() {
  const [{ userId }, program] = await Promise.all([
    auth(),
    getPublicProgramBySlug(CAPABLE_PROGRAM_SLUG),
  ])

  if (!program) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <Empty className="min-h-72 border border-dashed border-border/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Dumbbell />
            </EmptyMedia>
            <EmptyTitle>CAPABLE is not loaded yet</EmptyTitle>
            <EmptyDescription>
              Run the program seed to load all 36 self-paced sessions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const [workouts, recordedWorkoutIds] = await Promise.all([
    listVisibleProgramWorkouts(program.id),
    userId ? listRecordedWorkoutIds(userId, program.id) : Promise.resolve([]),
  ])
  const completed = new Set(recordedWorkoutIds)
  const nextWorkout = workouts.find((workout) => !completed.has(workout.id))
  const completedCount = workouts.filter((workout) =>
    completed.has(workout.id),
  ).length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-24 pt-8 sm:px-6 md:pb-16">
      <header className="border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
          Strength · Flexibility · Longevity
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              CAPABLE
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
              {program.description}
            </p>
          </div>
          {nextWorkout && (
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link
                  href={getCapableWorkoutHref(
                    nextWorkout.weekNumber ?? 1,
                    nextWorkout.sessionNumber ?? 1,
                  )}
                />
              }
            >
              {completedCount > 0 ? "Continue program" : "Start Week 1"}
              <ArrowRight />
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="outline">
            <Layers3 data-icon="inline-start" />
            12 weeks
          </Badge>
          <Badge variant="outline">
            <Dumbbell data-icon="inline-start" />3 sessions per week
          </Badge>
          <Badge variant="outline">
            <Gauge data-icon="inline-start" />
            Self-paced
          </Badge>
          {userId && (
            <Badge variant="secondary">
              <Check data-icon="inline-start" />
              {completedCount} of {workouts.length} recorded
            </Badge>
          )}
        </div>
      </header>

      <section className="grid gap-px border border-border/50 bg-border/50 sm:grid-cols-3">
        {CAPABLE_SESSIONS.map((session) => (
          <div key={session.number} className="bg-background p-4">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
              Suggested {session.rhythm}
            </p>
            <h2 className="mt-1 text-base font-semibold text-primary">
              {session.name}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {session.number === 1
                ? "Heavy lower-body strength and active hip, hamstring, and adductor range."
                : session.number === 2
                  ? "Handstand, bar muscle-up, front lever, and balanced upper-body strength."
                  : "Sustainable full-body capacity, resilience, carries, and locomotion."}
            </p>
          </div>
        ))}
      </section>

      <nav aria-label="Program phases" className="flex flex-wrap gap-2">
        {CAPABLE_PHASES.map((phase) => (
          <Button
            key={phase.number}
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`#phase-${phase.number}`} />}
          >
            Phase {phase.number} · {phase.name}
          </Button>
        ))}
      </nav>

      {CAPABLE_PHASES.map((phase) => (
        <section
          key={phase.number}
          id={`phase-${phase.number}`}
          className="scroll-mt-24 space-y-6"
        >
          <div className="border-l-2 border-primary pl-4">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">
              Phase {phase.number} · Weeks {phase.weeks[0]}–{phase.weeks.at(-1)}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {phase.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {phase.description}
            </p>
          </div>

          <div className="space-y-7">
            {phase.weeks.map((weekNumber) => {
              const weekWorkouts = workouts.filter(
                (workout) => workout.weekNumber === weekNumber,
              )

              return (
                <div key={weekNumber} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold">Week {weekNumber}</h3>
                    {weekNumber % 4 === 0 && (
                      <Badge variant="outline">Consolidate</Badge>
                    )}
                    <span className="h-px flex-1 bg-border/50" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {weekWorkouts.map((workout) => (
                      <WorkoutLink
                        key={workout.id}
                        workout={workout}
                        completed={completed.has(workout.id)}
                        isNext={workout.id === nextWorkout?.id}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
