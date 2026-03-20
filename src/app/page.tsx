"use client"

import { useState } from "react"

import type { ProviderName } from "@/server/db/schema"

import { DatePicker } from "@/components/date-picker"
import { ProgramWorkoutCard } from "@/components/program-workout-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutCard } from "@/components/workout-card"

import { useProgramWorkouts, usePrograms } from "@/lib/hooks/use-programs"
import { capitalize, getDateStr } from "@/lib/utils"

const providers: ProviderName[] = ["invictus", "pushjerk", "linchpin"]

function ProgramWorkoutsSection({ date }: { date: Date | undefined }) {
  const { programs } = usePrograms()
  const dateStr = getDateStr(date)

  if (!programs?.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Programs</h2>
      {programs.map((program) => (
        <ProgramDateWorkouts
          key={program.id}
          programId={program.id}
          programName={program.name}
          date={dateStr}
        />
      ))}
    </div>
  )
}

function ProgramDateWorkouts({
  programId,
  programName,
  date,
}: {
  programId: number
  programName: string
  date: string | undefined
}) {
  const { workouts } = useProgramWorkouts(programId)
  const filtered = workouts?.filter((w) => w.date === date) ?? []

  if (!filtered.length) return null

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-muted-foreground">
        {programName}
      </h3>
      {filtered.map((w) => (
        <ProgramWorkoutCard
          key={w.id}
          title={w.title}
          content={w.content}
          videoUrl={w.videoUrl}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<ProviderName>("invictus")

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-10 sm:px-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-bold">Workout</h1>
        <DatePicker date={date} setDate={setDate} />
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as ProviderName)}
        className="p-0"
      >
        <TabsList>
          {providers.map((p) => (
            <TabsTrigger key={p} value={p}>
              {capitalize(p)}
            </TabsTrigger>
          ))}
        </TabsList>
        {providers.map((p) => (
          <TabsContent key={p} value={p}>
            <WorkoutCard providerName={p} date={date} />
          </TabsContent>
        ))}
      </Tabs>

      <ProgramWorkoutsSection date={date} />
    </div>
  )
}
