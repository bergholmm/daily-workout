"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

type Props = {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DatePicker({ date, setDate }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left",
              !date && "text-muted-foreground",
            )}
          />
        }
      >
        <CalendarIcon className="h-3.5 w-3.5" />
        {date ? format(date, "MMM d") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
