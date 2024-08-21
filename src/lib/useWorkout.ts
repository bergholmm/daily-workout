import useSWR from 'swr'
import { type WorkoutName } from '~/app/page'

async function fetcher(...args: Parameters<typeof fetch>) {
  return (await fetch(...args)).json();
}

export const useWorkout = (workoutName: WorkoutName, date?: string) => {
  const { data, error, isLoading } = useSWR(`/api/workout?workoutName=${workoutName}&date=${date}`, fetcher)
  console.log('data', data, error, isLoading)

  return {
    data,
    isLoading,
    error,
  }
}
