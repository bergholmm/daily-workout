"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import type { ProviderName } from "@/server/db/schema"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { SEPARATOR } from "@/lib/constants"
import { useWorkout } from "@/lib/hooks/use-workout"
import { capitalize, getDateStr } from "@/lib/utils"

type Props = {
  providerName: ProviderName
  date: Date | undefined
}

export function WorkoutCard({ providerName, date }: Props) {
  const { workout, isLoading, error } = useWorkout(
    providerName,
    getDateStr(date),
  )

  useEffect(() => {
    if (error && error.message !== "Not Found") {
      toast.error(
        "An error occurred while fetching the workout. Please try again later.",
        {
          duration: 5000,
        },
      )
    }
  }, [error])

  if (isLoading) {
    return (
      <Card className="rounded-none border-0 bg-transparent">
        <CardHeader className="px-0">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <Skeleton className="h-[125px] rounded-xl" />
          <Skeleton className="h-[125px] rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-none border-0 bg-transparent">
      <CardHeader className="px-0">
        <CardTitle>{capitalize(providerName)}</CardTitle>
        <CardDescription>{getDateStr(date)}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {workout?.content.map((line, i) => (
          <p key={i}>{line === SEPARATOR ? <br /> : line}</p>
        ))}
        {error && error.info === "Workout not found" && (
          <p>No workout found for this date.</p>
        )}
      </CardContent>
    </Card>
  )
}
