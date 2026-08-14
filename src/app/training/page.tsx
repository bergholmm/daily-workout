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
import { listRecordedSessions } from "@/server/db/session-records"

import { ProgramRunControl } from "@/components/program-run-control"
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
  BUILT_TO_MOVE_EMPHASES,
  BUILT_TO_MOVE_LEVELS,
  BUILT_TO_MOVE_PROGRAM_SLUG,
  buildBuiltToMoveProgress,
  getBuiltToMoveDefinitionsForLevel,
  getBuiltToMoveWorkoutHref,
  selectBuiltToMoveView,
} from "@/lib/built-to-move-program"
import type { PublicProgramWorkout } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Built to Move · Strength, Flexibility & Longevity",
  description:
    "A self-paced 12-week program for bodyweight skill, useful strength, flexibility, and long-term capacity.",
}

type Props = {
  searchParams: Promise<{ level?: string; week?: string }>
}

function sessionKey(workoutId: number, weekNumber: number) {
  return `${workoutId}:${weekNumber}`
}

function parseInteger(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function selectionHref(levelNumber: number, weekNumber: number) {
  return `/training?level=${levelNumber}&week=${weekNumber}`
}

function WorkoutLink({
  workout,
  weekNumber,
  recorded,
  isNext,
}: {
  workout: PublicProgramWorkout
  weekNumber: number
  recorded: boolean
  isNext: boolean
}) {
  const emphasis = BUILT_TO_MOVE_EMPHASES.find(
    (item) => item.number === workout.emphasisNumber,
  )

  return (
    <Link
      href={getBuiltToMoveWorkoutHref(weekNumber, workout.emphasisNumber ?? 1)}
      className={`group flex min-h-44 flex-col border p-5 transition-colors ${
        isNext
          ? "border-primary/50 bg-primary/[0.07] hover:bg-primary/[0.1]"
          : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary">
          {emphasis?.name ?? `Workout ${workout.emphasisNumber}`}
        </p>
        {recorded ? (
          <Badge variant="secondary">
            <Check data-icon="inline-start" />
            Recorded
          </Badge>
        ) : isNext ? (
          <Badge>Up next</Badge>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug">
        {workout.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {workout.summary}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-muted-foreground">
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

export default async function TrainingPage({ searchParams }: Props) {
  const [{ userId }, program, requested] = await Promise.all([
    auth(),
    getPublicProgramBySlug(BUILT_TO_MOVE_PROGRAM_SLUG),
    searchParams,
  ])

  if (!program) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <Empty className="min-h-72 border border-dashed border-border/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Dumbbell />
            </EmptyMedia>
            <EmptyTitle>Built to Move is not loaded yet</EmptyTitle>
            <EmptyDescription>
              Run the program seed to load all nine workout definitions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const [workouts, progress] = await Promise.all([
    listVisibleProgramWorkouts(program.id),
    userId
      ? listRecordedSessions(userId, program.id)
      : Promise.resolve({ run: null, records: [] }),
  ])
  const trainingProgress = buildBuiltToMoveProgress(workouts, progress.records)
  const completed = trainingProgress.completedKeys
  const nextSlot = trainingProgress.nextSlot
  const fallbackSlot = nextSlot ?? trainingProgress.slots.at(-1)
  const selection = selectBuiltToMoveView(
    parseInteger(requested.level),
    parseInteger(requested.week),
    fallbackSlot?.weekNumber ?? null,
  )
  const selectedLevel = selection.level
  const selectedWeek = selection.weekNumber
  const selectedWorkouts = getBuiltToMoveDefinitionsForLevel(
    workouts,
    selectedLevel.number,
  )
  const completedCount = trainingProgress.completedCount
  const weekCompletedCount =
    trainingProgress.weekCompletedCounts[selectedWeek] ?? 0

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6 md:pb-16">
      <header className="border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
          Longevity · Flexibility · Strength
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Built to Move
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
              {program.description}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              This exact cycle is an evidence-informed pilot. Use the listed
              quality checks and fallbacks. Skill results are not guaranteed.
            </p>
          </div>
          {fallbackSlot && (
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link
                  href={getBuiltToMoveWorkoutHref(
                    fallbackSlot.weekNumber,
                    fallbackSlot.emphasisNumber,
                  )}
                />
              }
            >
              {completedCount === 0
                ? "Start Week 1"
                : nextSlot
                  ? "Continue program"
                  : "Review program"}
              <ArrowRight />
            </Button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="outline">
            <Layers3 data-icon="inline-start" />3 levels · 12 weeks
          </Badge>
          <Badge variant="outline">
            <Dumbbell data-icon="inline-start" />3 workouts per week
          </Badge>
          <Badge variant="outline">
            <Gauge data-icon="inline-start" />
            Self-paced
          </Badge>
          {userId && (
            <Badge variant="secondary">
              <Check data-icon="inline-start" />
              {completedCount} of 36 recorded
            </Badge>
          )}
        </div>
        {userId && completedCount > 0 && (
          <div className="mt-3">
            <ProgramRunControl completed={trainingProgress.isComplete} />
          </div>
        )}
      </header>

      <nav aria-label="Program levels" className="grid gap-2 sm:grid-cols-3">
        {BUILT_TO_MOVE_LEVELS.map((level) => (
          <Button
            key={level.number}
            variant={
              level.number === selectedLevel.number ? "default" : "outline"
            }
            nativeButton={false}
            render={<Link href={selectionHref(level.number, level.weeks[0])} />}
          >
            Level {level.number} · {level.name}
          </Button>
        ))}
      </nav>

      <section className="space-y-5">
        <div className="border-l-2 border-primary pl-4">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">
            Level {selectedLevel.number} · Weeks {selectedLevel.weeks[0]}–
            {selectedLevel.weeks.at(-1)}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            {selectedLevel.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {selectedLevel.description}
          </p>
        </div>

        <nav
          aria-label={`Weeks in Level ${selectedLevel.number}`}
          className="grid grid-cols-4 gap-2"
        >
          {selectedLevel.weeks.map((weekNumber) => {
            const recordedCount =
              trainingProgress.weekCompletedCounts[weekNumber] ?? 0
            return (
              <Button
                key={weekNumber}
                variant={weekNumber === selectedWeek ? "default" : "outline"}
                nativeButton={false}
                render={
                  <Link
                    href={selectionHref(selectedLevel.number, weekNumber)}
                  />
                }
              >
                {recordedCount === 3 && <Check />}
                Week {weekNumber}
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Week {selectedWeek}</h3>
          <p className="text-xs text-muted-foreground">
            {weekCompletedCount} of 3 recorded
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {BUILT_TO_MOVE_EMPHASES.map((emphasis) => {
            const workout = selectedWorkouts.find(
              (item) => item.emphasisNumber === emphasis.number,
            )
            if (!workout) return null
            return (
              <WorkoutLink
                key={emphasis.number}
                workout={workout}
                weekNumber={selectedWeek}
                recorded={completed.has(sessionKey(workout.id, selectedWeek))}
                isNext={
                  nextSlot?.workout.id === workout.id &&
                  nextSlot.weekNumber === selectedWeek
                }
              />
            )
          })}
        </div>
      </section>

      <aside className="grid gap-px border border-border/50 bg-border/50 sm:grid-cols-2">
        <div className="bg-background p-4">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-primary">
            Optional skill practice
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Add 5–10 minutes of fresh handstand practice on one rest day when
            your wrists and shoulders feel ready.
          </p>
        </div>
        <div className="bg-background p-4">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-primary">
            Supplemental aerobic work
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Easy running, cycling, or brisk walking can supplement the cycle.
            You can add an occasional Norwegian 4 × 4 only when recovery is
            good. It does not count toward program completion.
          </p>
        </div>
      </aside>
    </div>
  )
}
