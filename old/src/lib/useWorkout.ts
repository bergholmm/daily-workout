import useSWR from 'swr'
import { type PublicConfiguration, defaultConfig } from 'swr/_internal'

import { type Workout, type WorkoutName } from '~/lib/types'

import { type APIError } from './APIError'
import fetcher from './swr'

export const useWorkout = (workoutName: WorkoutName, date?: string) => {
  const res = useSWR<Workout, APIError>(
    `/api/workout?workoutName=${workoutName}&date=${date}`,
    fetcher,
    {
      onErrorRetry: (error, key, config, revalidate, revalidateOpts) => {
        const configForDelegate = config as Readonly<
          PublicConfiguration<Workout, APIError, (path: string) => unknown>
        >

        if (error.code === 404) return
        defaultConfig.onErrorRetry(
          error,
          key,
          configForDelegate,
          revalidate,
          revalidateOpts,
        )
      },
    },
  )

  return {
    workout: res.data,
    isLoading: res.isLoading,
    error: res.error,
  }
}
