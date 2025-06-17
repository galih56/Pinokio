"use client"
import { useState, useEffect } from "react"
import { CalendarIcon, Clock, X } from "lucide-react"
import { format } from "date-fns"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import "react-calendar/dist/Calendar.css"
import "react-clock/dist/Clock.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type ValuePiece = Date | null

interface DateTimePickerProps {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  showTimeSelect?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DateTimePickerInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Pick a date and time",
  showTimeSelect = true,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)

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
    setIsCalendarOpen(false)
  }

  // Handle time selection
  const handleTimeChange = (time: ValuePiece) => {
    if (!time) return

    const newDate = new Date(time)

    // If we already have a date selected, preserve it
    if (date) {
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
    }

    setDate(newDate)
    onChange(newDate)
  }

  // Clear the selection
  const handleClear = () => {
    setDate(undefined)
    onChange(undefined)
    setIsCalendarOpen(false)
    setIsTimePickerOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        {/* Date Picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
              minDate={minDate}
              maxDate={maxDate}
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker */}
        {showTimeSelect && (
          <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={disabled} className="ml-2 w-[120px]">
                <Clock className="mr-2 h-4 w-4" />
                {date ? format(date, "HH:mm") : "Time"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-2">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <div className="react-time-picker-wrapper">
                      <DateTimePicker
                        onChange={handleTimeChange}
                        value={date || null}
                        format="HH:mm"
                        disableClock={true}
                        calendarIcon={null}
                        clearIcon={null}
                        locale="en-US"
                        className="time-picker-only"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear Button */}
        {date && (
          <Button variant="ghost" size="icon" className="ml-1 h-10 w-10" onClick={handleClear} disabled={disabled}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
    </div>
  )
}
