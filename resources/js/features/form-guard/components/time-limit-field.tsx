"use client"
import { memo, useState, useCallback } from "react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NumberInput } from "@/components/ui/number-input"
import { Card, CardContent } from "@/components/ui/card"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { createFormInputSchema } from "../../api/create-form"

interface TimeLimitFieldProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
}

const TimeLimitField = memo(({ form, updateFormData }: TimeLimitFieldProps) => {
  const currentValue = form.watch("timeLimit")

  const [timeLimitType, setTimeLimitType] = useState<string>(() => {
    if (!currentValue) return "unlimited"
    if (["15", "30", "60", "120"].includes(String(currentValue))) {
      return String(currentValue)
    }
    return "custom"
  })

  const [customValue, setCustomValue] = useState<string>(() => {
    if (currentValue && !["15", "30", "60", "120"].includes(String(currentValue))) {
      return String(currentValue)
    }
    return ""
  })

  const handleTimeLimitChange = useCallback(
    (value: string) => {
      setTimeLimitType(value)

      if (value === "unlimited") {
        form.setValue("timeLimit", undefined)
        updateFormData({ timeLimit: undefined })
      } else if (value === "custom") {
        const numValue = customValue ? Number.parseInt(customValue) : undefined
        form.setValue("timeLimit", numValue)
        updateFormData({ timeLimit: numValue })
      } else {
        const numValue = Number.parseInt(value)
        form.setValue("timeLimit", numValue)
        updateFormData({ timeLimit: numValue })
        setCustomValue("")
      }
    },
    [form, updateFormData, customValue],
  )

  const handleCustomValueChange = useCallback(
    (value: string) => {
      setCustomValue(value)
      const numValue = value ? Number.parseInt(value) : undefined
      form.setValue("timeLimit", numValue)
      updateFormData({ timeLimit: numValue })
    },
    [form, updateFormData],
  )

  return (
    <FormField
      control={form.control}
      name="timeLimit"
      render={() => (
        <FormItem>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-row items-start justify-between">
                <div className="space-y-0.5 flex-1">
                  <FormLabel className="text-base">Time Limit</FormLabel>
                  <FormDescription>Set a time limit for form completion</FormDescription>
                </div>
              </div>

              <div className="space-y-3">
                <FormControl>
                  <Select value={timeLimitType} onValueChange={handleTimeLimitChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">No time limit</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="custom">Custom time...</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                {timeLimitType === "custom" && (
                  <div className="flex items-center space-x-2">
                    <NumberInput
                      value={customValue}
                      onChange={handleCustomValueChange}
                      placeholder="Enter minutes"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  )
})

TimeLimitField.displayName = "TimeLimitField"

export { TimeLimitField }
