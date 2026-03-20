import useSWR from "swr"

import type { ProviderName } from "@/server/db/schema"

import { APIError } from "../fetcher"
import fetcher from "../fetcher"

type Workout = {
  id: number
  date: string
  content: string[]
  providerName: ProviderName
  createdAt: string
}

export function useWorkout(providerName: ProviderName, date?: string) {
  const res = useSWR<Workout, APIError>(
    date ? `/api/workout?providerName=${providerName}&date=${date}` : null,
    fetcher,
    {
      onErrorRetry: (error) => {
        if (error.code === 404) return
      },
    },
  )

  return {
    workout: res.data,
    isLoading: res.isLoading,
    error: res.error,
  }
}
