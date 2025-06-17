"use client"

import { memo, useEffect } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { createFormInputSchema } from "../../api/create-form"
import { TimeLimitField } from "../time-limit-field"
import { FORMERR } from "dns"

interface AdvancedSettingsStepProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
}

const AdvancedSettingsStep = memo(({ form, updateFormData }: AdvancedSettingsStepProps) => {
  const isProctored = form.watch("proctored")
  const requiresIdentifier = form.watch("requiresIdentifier")
  const provider = form.watch("provider")
  const isPinokio = provider === "Pinokio" || !provider // Default to Pinokio if not set
  
  useEffect(() => {
    if (isProctored) {
      if (!form.getValues("timeLimit")) {
        form.setValue("timeLimit", 900);
      }
    } else {
      form.setValue("timeLimit", undefined);
    }
  }, [isProctored]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <FormField
              control={form.control}
              name="proctored"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center justify-between">
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
                  </FormItem>
                )
              }}
            />
          </CardContent>
        </Card>

        {isProctored && (
          <div className="space-y-4">
            {isPinokio && (
              <>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="requiresToken"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Access Token</FormLabel>
                              <FormDescription>
                                Users must enter a valid token to access the form
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  updateFormData({ requiresToken: checked })
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="requiresIdentifier"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require User Identifier</FormLabel>
                              <FormDescription>
                                Users must provide their email or ID to access the form
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  updateFormData({ requiresIdentifier: checked })
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )
                      }}
                    />

                    {/* Show identifier fields when requiresIdentifier is true for Pinokio */}
                    {(isPinokio && isProctored && requiresIdentifier) && (
                      <div className="mt-6 space-y-4 pl-4 border-l-2 border-muted">
                        <FormField
                          control={form.control}
                          name="identifierLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Identifier Label *</FormLabel>
                              <FormDescription>
                                Label shown to users for the identifier field
                              </FormDescription>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., Student ID, Email Address"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    updateFormData({ identifierLabel: e.target.value })
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="identifierType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Identifier Type *</FormLabel>
                              <FormDescription>
                                Type of identifier to help validate input
                              </FormDescription>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    updateFormData({ identifierType: value })
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select identifier type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="text">Free Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="identifierDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Identifier Description</FormLabel>
                              <FormDescription>
                                Help text shown to users about what to enter
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="e.g., Please enter your student ID number"
                                  onChange={(e) => {
                                    field.onChange(e)
                                    updateFormData({ identifierDescription: e.target.value })
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="timeLimit"
                  defaultValue={900}
                  render={({ field }) => (
                    <FormItem>
                      <TimeLimitField
                        value={field.value || 900}
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
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <FormField
              control={form.control}
              name="allowMultipleAttempts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
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
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </Form>
  )
})

AdvancedSettingsStep.displayName = "AdvancedSettingsStep"

export { AdvancedSettingsStep }
