"use client"
import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import type { createFormInputSchema } from "../../api/create-form"

interface GoogleFormConfigurationStepProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
}

const GoogleFormConfigurationStep = memo(({ form, updateFormData }: GoogleFormConfigurationStepProps) => {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="formUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Form URL *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://forms.google.com/..."
                  onChange={(e) => {
                    field.onChange(e)
                    updateFormData({ formUrl: e.target.value })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identifierLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier Label *</FormLabel>
              <FormDescription>
                This is used to sync Google Form responses. It helps Pinokio identify which record is filled by whom
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
                Make clearer identifier by minimizing typos. Pinokio will help you validate the identifier input
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
              <FormDescription>Tell your respondents what they should fill in the Identifier Label</FormDescription>
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
    </Form>
  )
})

GoogleFormConfigurationStep.displayName = "GoogleFormConfigurationStep"

export { GoogleFormConfigurationStep }
