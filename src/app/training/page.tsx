import { format, parseISO } from "date-fns"
import { ArrowLeft, ArrowRight, CalendarClock, RotateCcw } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import {
  getPublicProgramBySlug,
  listVisibleProgramWorkouts,
} from "@/server/db/programs"

import { PublicProgramWorkoutCard } from "@/components/public-program-workout"
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
  PROGRAM_TIME_ZONE,
  getDateInTimeZone,
  isTrainingDay,
  shiftDateString,
} from "@/lib/program-date"
import { dateSchema } from "@/lib/validators"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Training · Daily Workout",
  description: "Strength, skill, conditioning, and active range of motion.",
}

const PROGRAM_SLUG = "strength-skill-engine-range"

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function TrainingPage({ searchParams }: Props) {
  const today = getDateInTimeZone()
  const requestedDate = (await searchParams).date
  const selectedDate = dateSchema.safeParse(requestedDate).success
    ? requestedDate!
    : today

  const program = await getPublicProgramBySlug(PROGRAM_SLUG)
  const workouts = program ? await listVisibleProgramWorkouts(program.id) : []
  const workout = workouts.find((item) => item.date === selectedDate)
  const formattedDate = format(parseISO(selectedDate), "MMMM d, yyyy")
  const dayName = format(parseISO(selectedDate), "EEEE")
  const trainingDay = isTrainingDay(selectedDate)
  const future = selectedDate > today

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-24 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <header className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-primary">
              Strength · Skill · Engine · Range
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {dayName}
            </h1>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          <Badge variant="outline">
            <CalendarClock data-icon="inline-start" />
            Mon · Tue · Thu · Fri
          </Badge>
        </div>

        <div className="flex items-center justify-between border-y border-border/50 py-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/training?date=${shiftDateString(selectedDate, -1)}`}
              />
            }
          >
            <ArrowLeft />
            Previous
          </Button>
          {selectedDate !== today && (
            <Button
              variant="outline"
              size="xs"
              nativeButton={false}
              render={<Link href="/training" />}
            >
              <RotateCcw />
              Today
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/training?date=${shiftDateString(selectedDate, 1)}`}
              />
            }
          >
            Next
            <ArrowRight />
          </Button>
        </div>
      </header>

      {workout ? (
        <PublicProgramWorkoutCard workout={workout} />
      ) : (
        <Empty className="min-h-52 border border-dashed border-border/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>
              {future && trainingDay
                ? "Workout not published yet"
                : trainingDay
                  ? "No workout available"
                  : "Recovery day"}
            </EmptyTitle>
            <EmptyDescription>
              {future && trainingDay
                ? `This session becomes available at 05:00 ${PROGRAM_TIME_ZONE}.`
                : trainingDay
                  ? "The scheduled workout could not be found for this date."
                  : "Use today for walking, easy mobility, or complete rest."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {program?.description && (
        <aside className="border-t border-border/50 pt-5">
          <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            The program
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {program.description}
          </p>
        </aside>
      )}
    </div>
  )
}
