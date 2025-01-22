'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

import { SEPARATOR } from '~/lib/constants'
import { type WorkoutName } from '~/lib/types'
import { useWorkout } from '~/lib/useWorkout'
import { capitalize, getDateStr } from '~/lib/utils'

import { Skeleton } from './ui/skeleton'

type Props = {
  workoutName: WorkoutName
  date: Date | undefined
}

export const WorkoutCard: React.FC<Props> = ({ workoutName, date }) => {
  const { workout, isLoading, error } = useWorkout(
    workoutName,
    getDateStr(date),
  )

  useEffect(() => {
    if (error && error.message !== 'Not Found') {
      toast.error(
        'An error occurred while fetching the workout. Please try again later.',
        { duration: 5000 },
      )
    }
  }, [error])

  if (isLoading) {
    return (
      <Card className="rounded-none border-0 sm:rounded-xl sm:border bg-muted/0 sm:bg-card">
        <CardHeader className="px-0 sm:p-6">
          <CardTitle>
            <Skeleton className="h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:p-6">
          <Skeleton className="h-[125px] rounded-xl" />
        </CardContent>
        <CardContent className="px-0 sm:p-6">
          <Skeleton className="h-[125px] rounded-xl" />
        </CardContent>
        <CardContent className="px-0 sm:p-6">
          <Skeleton className="h-[125px] rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-none border-0 sm:rounded-xl sm:border bg-muted/0 sm:bg-card">
      <CardHeader className="px-0 sm:p-6">
        <CardTitle>{capitalize(workoutName)}</CardTitle>
        <CardDescription>{getDateStr(date)}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:p-6">
        {workout?.workout.map((exercise, i) => (
          <p key={i}>{exercise === SEPARATOR ? <br /> : exercise}</p>
        ))}
        {error && error.info === 'Workout not found' && (
          <p>No workout found for this date.</p>
        )}
      </CardContent>
    </Card>
  )
}
