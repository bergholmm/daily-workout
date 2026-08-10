"use client"

import { format, startOfDay } from "date-fns"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

import type { ProviderName } from "@/server/db/schema"

import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutCard } from "@/components/workout-card"

import { capitalize } from "@/lib/utils"

import { useIsMobile } from "@/hooks/use-mobile"

const providers: ProviderName[] = ["pushjerk", "linchpin"]

function DayContent({
  date,
  tab,
  setTab,
}: {
  date: Date | undefined
  tab: ProviderName
  setTab: (tab: ProviderName) => void
}) {
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as ProviderName)}>
      <TabsList variant="line">
        {providers.map((provider) => (
          <TabsTrigger key={provider} value={provider}>
            {capitalize(provider)}
          </TabsTrigger>
        ))}
      </TabsList>
      {providers.map((provider) => (
        <TabsContent key={provider} value={provider} className="mt-4">
          <WorkoutCard providerName={provider} date={date} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function SwipeableContent({
  children,
  onSwipeLeft,
  onSwipeRight,
}: {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: 1,
    watchDrag: true,
  })

  useEffect(() => {
    if (!emblaApi) return
    const onSettle = () => {
      const index = emblaApi.selectedScrollSnap()
      if (index === 0) {
        onSwipeRight()
        requestAnimationFrame(() => emblaApi.scrollTo(1, true))
      } else if (index === 2) {
        onSwipeLeft()
        requestAnimationFrame(() => emblaApi.scrollTo(1, true))
      }
    }
    emblaApi.on("settle", onSettle)
    return () => {
      emblaApi.off("settle", onSettle)
    }
  }, [emblaApi, onSwipeLeft, onSwipeRight])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.scrollTo(1, true)
  }, [emblaApi, children])

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex">
        <div className="min-w-0 shrink-0 grow-0 basis-full" />
        <div className="min-w-0 shrink-0 grow-0 basis-full">{children}</div>
        <div className="min-w-0 shrink-0 grow-0 basis-full" />
      </div>
    </div>
  )
}

export default function DailyWorkoutPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tab, setTab] = useState<ProviderName>("pushjerk")
  const isMobile = useIsMobile()

  const isToday =
    date && startOfDay(date).getTime() === startOfDay(new Date()).getTime()

  function shiftDate(days: number) {
    if (!date) return
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    setDate(next)
  }

  const dayContent = <DayContent date={date} tab={tab} setTab={setTab} />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:pb-16 lg:max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Daily Workout
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {date ? format(date, "EEEE") : "Select a date"}
          </h1>
          {date && (
            <p className="text-sm text-muted-foreground">
              {format(date, "MMMM d, yyyy")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(-1)}
            className="h-11 w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <DatePicker date={date} setDate={setDate} />
          {!isToday && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(1)}
            className="h-11 w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMobile ? (
        <SwipeableContent
          onSwipeLeft={() => shiftDate(1)}
          onSwipeRight={() => shiftDate(-1)}
        >
          {dayContent}
        </SwipeableContent>
      ) : (
        dayContent
      )}
    </div>
  )
}
