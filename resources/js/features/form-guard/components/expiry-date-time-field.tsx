"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, AlertCircle, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { DateTimePickerInput } from "@/components/ui/date-picker/datetime-picker-input"
import { DateTimeInput } from "@/components/ui/date-picker/date-time-picker"

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
  variant?: "popover" | "select"
}

// Utility functions to replace date-fns
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const endOfDay = (date: Date): Date => {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

const isBefore = (date: Date, dateToCompare: Date): boolean => {
  return date.getTime() < dateToCompare.getTime()
}

const isAfter = (date: Date, dateToCompare: Date): boolean => {
  return date.getTime() > dateToCompare.getTime()
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
  variant = "popover",
}: ExpiryDateTimeFieldProps) {
  // Track if expiry is enabled (can turn off for no-expiry mode)
  const [hasExpiry, setHasExpiry] = useState<boolean>(value !== null)

  // Set default expiry if no value provided
  useEffect(() => {
    if (!hasExpiry) return
    if (!value) {
      const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))
      onChange(defaultExpiry)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExpiry])

  // Get preset dates for easy comparison
  const presetDates = useMemo(() => {
    return presets.map((preset) => ({
      label: preset.label,
      date: endOfDay(addDays(new Date(), preset.days)),
      days: preset.days,
    }))
  }, [presets])

  /** Handle when the user picks a date/time from DateTimePickerInput */
  function handleInputChange(date: Date | undefined) {
    if (!hasExpiry) {
      if (value !== null) onChange(null)
      return
    }
    if (!date) {
      onChange(null)
      return
    }
    // Check min/max
    if (minDate && isBefore(date, minDate)) return
    if (maxDate && isAfter(date, maxDate)) return
    onChange(date)
  }

  /** Preset badge click sets date & time to preset's end-of-day */
  function handlePresetClick(days: number) {
    const presetDate = endOfDay(addDays(new Date(), days))
    setHasExpiry(true)
    onChange(presetDate)
  }

  /** Toggle expiry on/off */
  function handleExpiryToggle(enabled: boolean) {
    setHasExpiry(enabled)
    if (!enabled) {
      onChange(null)
    } else {
      const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))
      onChange(defaultExpiry)
    }
  }

  /** Clear expiry (set no expiry) */
  function clearExpiry() {
    setHasExpiry(false)
    onChange(null)
  }

  function isExpired() {
    return value && isBefore(value, new Date())
  }

  function isValidDateTime(dt: Date | null): boolean {
    if (!hasExpiry) return true
    if (!dt) return false
    if (minDate && isBefore(dt, minDate)) return false
    if (maxDate && isAfter(dt, maxDate)) return false
    return true
  }

  /** For error messages */
  function getValidationMessage() {
    if (!hasExpiry) return null
    if (!value) return "Please select both date and time"
    if (minDate && isBefore(value, minDate)) {
      return `Date must be after ${formatDateTime(minDate)}`
    }
    if (maxDate && isAfter(value, maxDate)) {
      return `Date must be before ${formatDateTime(maxDate)}`
    }
    if (isExpired()) {
      return "Selected date/time is in the past"
    }
    return null
  }

  // Check if a preset is currently selected
  function isPresetSelected(preset: { date: Date; days: number }) {
    if (!value) return false
    return (
      value.getDate() === preset.date.getDate() &&
      value.getMonth() === preset.date.getMonth() &&
      value.getFullYear() === preset.date.getFullYear() &&
      value.getHours() === preset.date.getHours() &&
      value.getMinutes() === preset.date.getMinutes()
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
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
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {presetDates.map((preset) => {
              const isSelected = isPresetSelected(preset)
              return (
                <Badge
                  key={preset.days}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handlePresetClick(preset.days)}
                >
                  {preset.label}
                </Badge>
              )
            })}
            {value && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-destructive/10 text-destructive border-destructive transition-colors"
                onClick={clearExpiry}
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Badge>
            )}
          </div>

          {/* DateTime Picker */}
          <div className="space-y-3">
            {variant === "popover" ? (
              <DateTimePickerInput
                value={hasExpiry ? (value ?? undefined) : undefined}
                onChange={handleInputChange}
                showTimeSelect={true}
                minDate={minDate}
                maxDate={maxDate}
                placeholder="Select expiry date and time"
              />
            ) : (
              <DateTimeInput
                value={hasExpiry ? (value ?? undefined) : undefined}
                onChange={handleInputChange}
                showTimeSelect={true}
                minDate={minDate}
                maxDate={maxDate}
                placeholder="Select expiry date and time"
              />
            )}

            {/* Validation Message */}
            {getValidationMessage() && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{getValidationMessage()}</span>
              </div>
            )}

            {/* Display Current Selection */}
            {isValidDateTime(value) && value && (
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
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              No expiry date set - this will remain active indefinitely
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
