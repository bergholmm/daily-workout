"use client"

import { DatePicker } from "~/components/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { WorkoutCard } from "~/components/workout-card"
import { useState } from "react"
import { capitalize } from "~/lib/utils"
import { useWorkout } from "~/lib/useWorkout"

export type WorkoutName = "invictus" | "pushjerk" | "linchpin"
const tabs: WorkoutName[] = ["invictus", "pushjerk", "linchpin"]

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<WorkoutName>("invictus")

  const workout = useWorkout(tab, date ? date.toISOString().split('T')[0]! : undefined)

  return (
    <main className="container flex flex-col justify-center">
      <div className="flex flex-wrap gap-4 pt-10 flex-col">
        <div className="flex flex-wrap flex-row justify-between items-start">
          <h1 className="text-5xl font-bold font-mono pb-5">
            Workout
          </h1>
          <DatePicker date={date} setDate={(date) => setDate(date)} />
        </div>
        <div className="flex flex-wrap flex-row">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as WorkoutName)}
            className="container p-0 font-mono">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>{capitalize(tab)}</TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab} value={tab}>{workout?.data?.workout}</TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </main >
  )
}
