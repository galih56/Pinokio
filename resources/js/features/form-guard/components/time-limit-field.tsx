"use client"

import { useState, useEffect } from "react"
import { formatDuration, intervalToDuration } from "date-fns"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Clock, AlertCircle } from "lucide-react"

interface TimeLimitFieldProps {
  value: number // in seconds
  onChange: (seconds: number) => void
  label?: string
  description?: string
  min?: number // in seconds
  max?: number // in seconds
  presets?: Array<{ label: string; seconds: number }>
}

export function TimeLimitField({
  value,
  onChange,
  label = "Time Limit",
  description = "Set how long respondents have to complete the assessment",
  min = 60, // 1 minute
  max = 28800, // 8 hours
  presets = [
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "15 min", seconds: 900 },
    { label: "30 min", seconds: 1800 },
    { label: "45 min", seconds: 2700 },
    { label: "1 hour", seconds: 3600 },
    { label: "1.5 hours", seconds: 5400 },
    { label: "2 hours", seconds: 7200 },
  ],
}: TimeLimitFieldProps) {
  const [inputValue, setInputValue] = useState("")
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes")

  // Convert seconds to display format using date-fns
  useEffect(() => {
    const duration = intervalToDuration({ start: 0, end: value * 1000 })

    if (value >= 3600 && value % 3600 === 0) {
      // Whole hours
      setUnit("hours")
      setInputValue((duration.hours || 0).toString())
    } else if (value >= 60 && value % 60 === 0) {
      // Whole minutes
      setUnit("minutes")
      setInputValue(((duration.minutes || 0) + (duration.hours || 0) * 60).toString())
    } else {
      // Default to minutes with decimal
      setUnit("minutes")
      setInputValue((value / 60).toString())
    }
  }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    const numValue = Number.parseFloat(newValue)

    if (!Number.isNaN(numValue) && numValue > 0) {
      const seconds = unit === "hours" ? Math.round(numValue * 3600) : Math.round(numValue * 60)
      if (seconds >= min && seconds <= max) {
        onChange(seconds)
      }
    }
  }

  const handleUnitChange = (newUnit: "minutes" | "hours") => {
    setUnit(newUnit)
    const numValue = Number.parseFloat(inputValue)

    if (!Number.isNaN(numValue)) {
      if (newUnit === "hours" && unit === "minutes") {
        setInputValue((numValue / 60).toString())
      } else if (newUnit === "minutes" && unit === "hours") {
        setInputValue((numValue * 60).toString())
      }
    }
  }

  // Format duration using date-fns
  const formatDurationFromSeconds = (seconds: number) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

    // Custom formatting for better UX
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`
    }

    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60

      if (remainingSeconds === 0) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`
      }
      return `${minutes}m ${remainingSeconds}s`
    }

    // For longer durations, use date-fns formatDuration
    return formatDuration(duration, {
      format: ["hours", "minutes"],
      delimiter: " ",
    })
  }

  const isValidInput = () => {
    const numValue = Number.parseFloat(inputValue)
    if (Number.isNaN(numValue)) return false

    const seconds = unit === "hours" ? numValue * 3600 : numValue * 60
    return seconds >= min && seconds <= max
  }

  const getMinMaxDisplay = () => {
    return {
      min: formatDurationFromSeconds(min),
      max: formatDurationFromSeconds(max),
    }
  }

  const { min: minDisplay, max: maxDisplay } = getMinMaxDisplay()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {label}
        </Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Badge
            key={preset.seconds}
            variant={value === preset.seconds ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => onChange(preset.seconds)}
          >
            {preset.label}
          </Badge>
        ))}
      </div>

      {/* Custom Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter time"
            min={unit === "hours" ? min / 3600 : min / 60}
            max={unit === "hours" ? max / 3600 : max / 60}
            step={unit === "hours" ? 0.25 : 1}
          />
        </div>
        <Select value={unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">min</SelectItem>
            <SelectItem value="hours">hrs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Validation & Display */}
      <div className="space-y-2">
        {!isValidInput() && inputValue && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>
              Please enter a valid time between {minDisplay} and {maxDisplay}
            </span>
          </div>
        )}

        {isValidInput() && (
          <div className="text-sm text-muted-foreground">
            Duration: <span className="font-medium">{formatDurationFromSeconds(value)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
