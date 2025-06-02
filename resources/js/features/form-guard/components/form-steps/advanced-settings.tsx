"use client"

import { memo } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { createFormInputSchema } from "../../api/create-form"
import { TimeLimitField } from "../time-limit-field"

interface AdvancedSettingsStepProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
}

const AdvancedSettingsStep = memo(({ form, updateFormData }: AdvancedSettingsStepProps) => {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="proctored"
          render={({ field }) => {
            return (
              <FormItem>
                <Card>
                  <CardContent className="flex flex-row items-center justify-between p-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activate Proctoring</FormLabel>
                      <FormDescription>
                        By activating this feature, users should install Pinokio Google Form Extension
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          updateFormData({ proctored: checked })
                        }}
                      />
                    </FormControl>
                  </CardContent>
                </Card>
              </FormItem>
            )
          }}
        />

        {form.watch("proctored") && (
          <FormField
            control={form.control}
            name="timeLimit"
            render={({ field }) => (
              <FormItem>
                <Card>
                  <CardContent className="p-6">
                    <TimeLimitField
                      value={field.value || 900} // Default 15 minutes if undefined
                      onChange={(seconds) => {
                        field.onChange(seconds)
                        updateFormData({ timeLimit: seconds })
                      }}
                      label="Assessment Time Limit"
                      description="How long respondents have to complete the assessment once they start"
                      presets={[
                        { label: "5 min", seconds: 300 },
                        { label: "10 min", seconds: 600 },
                        { label: "15 min", seconds: 900 },
                        { label: "30 min", seconds: 1800 },
                        { label: "45 min", seconds: 2700 },
                        { label: "1 hour", seconds: 3600 },
                        { label: "2 hours", seconds: 7200 },
                      ]}
                    />
                    <FormMessage />
                  </CardContent>
                </Card>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="allowMultipleAttempts"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardContent className="flex flex-row items-center justify-between p-6">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Multiple Attempts</FormLabel>
                    <FormDescription>Users can submit the form multiple times</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        updateFormData({ allowMultipleAttempts: checked })
                      }}
                    />
                  </FormControl>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
})

AdvancedSettingsStep.displayName = "AdvancedSettingsStep"

export { AdvancedSettingsStep }
