"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import RichTextEditor from "@/components/ui/text-editor"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { createFormInputSchema } from "../../api/create-form"
import type { Editor } from "@tiptap/react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { ExpiryDateTimeField } from "../expiry-date-time-field"

interface BasicInformationStepProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
  editor: Editor
}

const BasicInformationStep = memo(({ form, updateFormData, editor }: BasicInformationStepProps) => {
  // Get the current time limit value for display
  const timeLimit = form.watch("timeLimit") ? Math.floor(form.watch("timeLimit") / 60) : 15
  const expiresAt = form.watch("expiresAt")

  const handleExpiresAtChange = (date: Date | null) => {
    form.setValue("expiresAt", date)
    updateFormData({ expiresAt: date })
  }
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter form title"
                  onChange={(e) => {
                    field.onChange(e)
                    updateFormData({ title: e.target.value })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Standalone Expiry Date/Time Input */} 
        <ExpiryDateTimeField
          value={expiresAt}
          onChange={handleExpiresAtChange}
          label="Expires At"
          description="Set when this form should be completed by"
          defaultExpiryDays={1}
          allowNoExpiry={true}
          presets={[
            { label: "1 day", days: 1 },
            { label: "3 days", days: 3 },
            { label: "1 week", days: 7 },
            { label: "2 weeks", days: 14 },
            { label: "1 month", days: 30 },
          ]}
        />

        {/* Time Limit Info */}
        {form.watch("proctored") && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Responders will have <strong>{timeLimit} minutes</strong> to complete the assessment once they open the
                link.
              </span>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => {
            const isExternal = field.value === "Google Form"

            return (
              <FormItem>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">External Form Integration</FormLabel>
                      <FormDescription>
                        Enable this to integrate with external form providers like Google Forms
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={isExternal}
                        onCheckedChange={(checked) => {
                          const value = checked ? "Google Form" : "Pinokio"
                          field.onChange(value)
                          updateFormData({ provider: value })
                        }}
                      />
                    </FormControl>
                  </div>

                  {/* Commented out until Google Form extension is ready */}
                  {/* {isExternal && (
                    <div className="pl-4 border-l-2 border-muted">
                      <FormLabel className="text-sm">External Provider</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          updateFormData({ provider: value })
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select external provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Google Form">Google Forms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )} */}
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="accessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Type *</FormLabel>
              <FormDescription>
                Controls who can access this form. Choose token or identifier for restricted access.
              </FormDescription>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    updateFormData({ accessType: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Open to Everyone</SelectItem>
                    <SelectItem value="token">Authorized Link</SelectItem>
                    <SelectItem value="identifier">Requires Personal ID</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  editor={editor}
                  onChange={(content) => {
                    field.onChange(content)
                    updateFormData({ description: content })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
})

BasicInformationStep.displayName = "BasicInformationStep"

export { BasicInformationStep }
