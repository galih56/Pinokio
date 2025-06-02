"use client"

import { useState, useEffect } from "react"
import { addDays, endOfDay, format, isAfter, isBefore } from "date-fns"
import { Calendar, Clock, AlertCircle, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { formatDateTime } from "@/lib/datetime"

interface ExpiryDateTimeFieldProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  description?: string
  defaultExpiryDays?: number
  allowNoExpiry?: boolean
  minDate?: Date
  maxDate?: Date
  presets?: Array<{ label: string; days: number }>
  className?: string
}

export function ExpiryDateTimeField({
  value,
  onChange,
  label = "Expiry Date & Time",
  description = "Set when this should expire",
  defaultExpiryDays = 1,
  allowNoExpiry = true,
  minDate = new Date(),
  maxDate,
  presets = [
    { label: "1 day", days: 1 },
    { label: "3 days", days: 3 },
    { label: "1 week", days: 7 },
    { label: "2 weeks", days: 14 },
    { label: "1 month", days: 30 },
  ],
  className = "",
}: ExpiryDateTimeFieldProps) {
  const [dateValue, setDateValue] = useState<string>("")
  const [timeValue, setTimeValue] = useState<string>("")
  const [hasExpiry, setHasExpiry] = useState<boolean>(true)

  // Initialize values when component mounts or value changes
  useEffect(() => {
    if (value) {
      setDateValue(format(value, "yyyy-MM-dd"))
      setTimeValue(format(value, "HH:mm"))
      setHasExpiry(true)
    } else {
      // Set default expiry if no value provided
      if (hasExpiry && !dateValue && !timeValue) {
        const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))
        setDateValue(format(defaultExpiry, "yyyy-MM-dd"))
        setTimeValue(format(defaultExpiry, "HH:mm"))
        onChange(defaultExpiry)
      } else if (!hasExpiry) {
        setDateValue("")
        setTimeValue("")
      }
    }
  }, [value, defaultExpiryDays, hasExpiry])

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate)
    updateDateTime(newDate, timeValue)
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    updateDateTime(dateValue, newTime)
  }

  const updateDateTime = (date: string, time: string) => {
    if (!hasExpiry) {
      onChange(null)
      return
    }

    if (date && time) {
      const newDateTime = new Date(`${date}T${time}`)

      // Validate against min/max dates
      if (minDate && isBefore(newDateTime, minDate)) {
        return // Don't update if before min date
      }
      if (maxDate && isAfter(newDateTime, maxDate)) {
        return // Don't update if after max date
      }

      onChange(newDateTime)
    }
  }

  const handlePresetClick = (days: number) => {
    const presetDate = endOfDay(addDays(new Date(), days))
    setDateValue(format(presetDate, "yyyy-MM-dd"))
    setTimeValue(format(presetDate, "HH:mm"))
    setHasExpiry(true)
    onChange(presetDate)
  }

  const handleExpiryToggle = (enabled: boolean) => {
    setHasExpiry(enabled)
    if (!enabled) {
      setDateValue("")
      setTimeValue("")
      onChange(null)
    } else {
      // Set default when enabling
      const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))
      setDateValue(format(defaultExpiry, "yyyy-MM-dd"))
      setTimeValue(format(defaultExpiry, "HH:mm"))
      onChange(defaultExpiry)
    }
  }

  const clearExpiry = () => {
    setDateValue("")
    setTimeValue("")
    setHasExpiry(false)
    onChange(null)
  }

  const isExpired = () => {
    if (!value) return false
    return isBefore(value, new Date())
  }

  const isValidDateTime = () => {
    if (!hasExpiry) return true
    if (!dateValue || !timeValue) return false

    const dateTime = new Date(`${dateValue}T${timeValue}`)

    if (minDate && isBefore(dateTime, minDate)) return false
    if (maxDate && isAfter(dateTime, maxDate)) return false

    return true
  }

  const getValidationMessage = () => {
    if (!hasExpiry) return null
    if (!dateValue || !timeValue) return "Please select both date and time"

    const dateTime = new Date(`${dateValue}T${timeValue}`)

    if (minDate && isBefore(dateTime, minDate)) {
      return `Date must be after ${formatDateTime(minDate)}`
    }
    if (maxDate && isAfter(dateTime, maxDate)) {
      return `Date must be before ${formatDateTime(maxDate)}`
    }
    if (isExpired()) {
      return "Selected date/time is in the past"
    }

    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {label}
          </Label>
          {allowNoExpiry && (
            <div className="flex items-center gap-2">
              <Label htmlFor="has-expiry" className="text-sm">
                Set expiry
              </Label>
              <Switch id="has-expiry" checked={hasExpiry} onCheckedChange={handleExpiryToggle} />
            </div>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {hasExpiry && (
        <div>
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const presetDate = endOfDay(addDays(new Date(), preset.days))
              const isSelected =
                value &&
                format(value, "yyyy-MM-dd") === format(presetDate, "yyyy-MM-dd") &&
                format(value, "HH:mm") === format(presetDate, "HH:mm")

              return (
                <Badge
                  key={preset.days}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handlePresetClick(preset.days)}
                >
                  {preset.label}
                </Badge>
              )
            })}
            {value && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive/10 text-destructive border-destructive"
                onClick={clearExpiry}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Badge>
            )}
          </div>

          {/* Date/Time Inputs */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="expiry-date" className="text-sm font-medium">
                  Date
                </Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={dateValue}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={minDate ? format(minDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                  max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
                  className="mt-1"
                  style={{ colorScheme: "light" }}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="expiry-time" className="text-sm font-medium">
                  Time
                </Label>
                <Input
                  id="expiry-time"
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="mt-1"
                  style={{ colorScheme: "light" }}
                />
              </div>
            </div>

            {/* Validation Message */}
            {getValidationMessage() && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{getValidationMessage()}</span>
              </div>
            )}

            {/* Display Current Selection */}
            {isValidDateTime() && value && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Will expire:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isExpired() ? "destructive" : "secondary"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDateTime(value)}
                    </Badge>
                    {isExpired() && <Badge variant="destructive">Expired</Badge>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Expiry State */}
      {!hasExpiry && allowNoExpiry && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              No expiry date set - this will remain active indefinitely
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
