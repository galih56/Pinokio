"use client"
import { useState, useEffect } from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimeInputProps {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  showTimeSelect?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DateTimeInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Pick a date",
  showTimeSelect = true,
  minDate,
  maxDate,
}: DateTimeInputProps) {
  const [date, setDate] = useState<Date | undefined>(value)

  // Update internal state when prop changes
  useEffect(() => {
    setDate(value)
  }, [value])

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    const newDate = new Date(selectedDate)

    // Preserve time from existing date if available
    if (date) {
      newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
    }

    setDate(newDate)
    onChange(newDate)
  }

  // Handle hour selection
  const handleHourChange = (hour: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setHours(Number.parseInt(hour, 10), 0, 0, 0)
      setDate(newDate)
      onChange(newDate)
      return
    }

    const newDate = new Date(date)
    newDate.setHours(Number.parseInt(hour, 10))
    setDate(newDate)
    onChange(newDate)
  }

  // Handle minute selection
  const handleMinuteChange = (minute: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setMinutes(Number.parseInt(minute, 10), 0, 0)
      setDate(newDate)
      onChange(newDate)
      return
    }

    const newDate = new Date(date)
    newDate.setMinutes(Number.parseInt(minute, 10))
    setDate(newDate)
    onChange(newDate)
  }

  // Generate hours and minutes for select
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        {/* Date Input */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
            />
          </PopoverContent>
        </Popover>

        {/* Time Input */}
        {showTimeSelect && date && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />

            {/* Hours */}
            <Select
              value={date ? date.getHours().toString().padStart(2, "0") : undefined}
              onValueChange={handleHourChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground">:</span>

            {/* Minutes */}
            <Select
              value={date ? date.getMinutes().toString().padStart(2, "0") : undefined}
              onValueChange={handleMinuteChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
