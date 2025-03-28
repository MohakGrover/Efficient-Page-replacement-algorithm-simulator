import { ChevronDown } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { useSidebar } from "@/components/ui/sidebar"

interface CalendarsProps {
  calendars: {
    name: string
    items: string[]
  }[]
}

export function Calendars({ calendars }: CalendarsProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-lg font-semibold tracking-tight", isOpen ? "opacity-100" : "opacity-0")}>Calendars</h2>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-all",
            isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90",
          )}
        />
      </div>
      <Accordion type="multiple" className="space-y-2">
        {calendars.map((calendar) => (
          <AccordionItem key={calendar.name} value={calendar.name} className="border-none">
            <AccordionTrigger
              className={cn(
                "flex items-center gap-1 rounded-md border border-transparent p-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                isOpen ? "justify-between" : "justify-center",
              )}
            >
              {isOpen ? calendar.name : <span className="sr-only">{calendar.name}</span>}
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
              {calendar.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Checkbox id={item} />
                  <label
                    htmlFor={item}
                    className="w-full cursor-pointer text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

