"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSidebar } from "@/components/ui/sidebar"

export function DatePicker() {
  const [date, setDate] = React.useState<Date>()
  const { isOpen } = useSidebar()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-lg font-semibold tracking-tight", isOpen ? "opacity-100" : "opacity-0")}>Date</h2>
        <CalendarIcon className={cn("h-4 w-4 text-muted-foreground", isOpen ? "opacity-100" : "opacity-0")} />
      </div>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground",
                isOpen ? "w-full" : "w-9 p-0",
              )}
            >
              {isOpen ? date ? format(date, "PPP") : "Pick a date" : <CalendarIcon className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

