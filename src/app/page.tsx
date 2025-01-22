'use client'

import { useState } from 'react'

import { DatePicker } from '~/components/date-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { WorkoutCard } from '~/components/workout-card'

import { type WorkoutName } from '~/lib/types'
import { capitalize } from '~/lib/utils'

const tabs: WorkoutName[] = ['invictus', 'pushjerk', 'linchpin']

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<WorkoutName>('invictus')

  return (
    <div className="flex flex-wrap px-0 sm:container gap-4 pt-10 flex-col sm:max-w-2xl">
      <div className="flex flex-wrap flex-row justify-between items-end gap-4 px-4 sm:px-0">
        <h1 className="text-5xl font-bold font-mono">Workout</h1>
        <DatePicker date={date} setDate={(date) => setDate(date)} />
      </div>
      <div className="flex flex-wrap flex-row">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as WorkoutName)}
          className="container p-0 m-0 font-mono px-4 sm:px-0"
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {capitalize(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <WorkoutCard workoutName={tab} date={date} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
