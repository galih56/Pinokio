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

interface BasicInformationStepProps {
  form: UseFormReturn<z.infer<typeof createFormInputSchema>>
  updateFormData: (data: Partial<z.infer<typeof createFormInputSchema>>) => void
  editor: Editor
}

const BasicInformationStep = memo(({ form, updateFormData, editor }: BasicInformationStepProps) => {
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
                    <SelectItem value="token">Requires Token Access</SelectItem>
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
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Form Provider *</FormLabel>
              <FormDescription>
                Choose your form provider. Google Forms allows integration with external forms.
              </FormDescription>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    updateFormData({ provider: value })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider of this form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pinokio">Pinokio</SelectItem>
                    <SelectItem value="Google Form">Google Form</SelectItem>
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
