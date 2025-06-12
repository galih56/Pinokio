"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import type { FormSection } from "@/types/form"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PreviewableImage } from "./previewable-image"
import { useSubmitFormResponse } from "../../api/use-submit-form-response"

interface DynamicFormProps {
  formHashId?: string // Use hash ID instead of regular ID
  sections: FormSection[]
  title: string
  description: string
  onSubmit?: (data: any) => void
  isPreview?: boolean
}

function createFormSchema(sections: FormSection[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      // Use the backend-generated field name (which is unique)
      const fieldKey = field.name
      
      let fieldSchema: z.ZodTypeAny

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Please enter a valid email address")
          break
        case "number":
          fieldSchema = z.coerce.number()
          if (field.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.min)
          }
          if (field.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.max)
          }
          break
        case "url":
          fieldSchema = z.string().url("Please enter a valid URL")
          break
        case "date":
          fieldSchema = z.string().min(1, "Please select a date")
          break
        case "checkbox":
          fieldSchema = z.array(z.string()).optional()
          break
        default:
          fieldSchema = z.string()
      }

      if (field.isRequired && field.type !== "checkbox") {
        fieldSchema = fieldSchema.min(1, "This field is required")
      } else if (!field.isRequired) {
        fieldSchema = fieldSchema.optional()
      }

      schemaFields[fieldKey] = fieldSchema
    })
  })

  return z.object(schemaFields)
}

export function DynamicForm({ 
  formHashId, 
  sections, 
  title, 
  description, 
  onSubmit,
  isPreview = false 
}: DynamicFormProps) {
  
  const hasValidationErrors =
    !sections || sections.length === 0 || sections.flatMap((section) => section?.fields || []).length === 0

  const allFields = useMemo(() => {
    try {
      return sections?.flatMap((section) => section?.fields || []) || []
    } catch (error) {
      console.error("Error processing form data:", error)
      return [];
    }
  }, [sections])
  const schema = createFormSchema(sections)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: allFields.reduce(
      (acc, field) => {
        const fieldKey = field.name
        acc[fieldKey] = field.type === "checkbox" ? [] : field.defaultValue || ""
        return acc
      },
      {} as Record<string, any>,
    ),
  })

  const submitForm = useSubmitFormResponse({ formId: formHashId! }) // assumes formHashId is defined when not in preview

  const handleSubmit = async (data: any) => {
    if (isPreview || !formHashId) {
      toast.success("Form submitted successfully! (Preview mode)")
      onSubmit?.(data)
      return
    }

    try {
      await submitForm.mutateAsync(data)
      toast.success("Form submitted successfully!")
      form.reset()
      onSubmit?.(data)
    } catch (error: any) {
      console.error("Submission failed", error)
      toast.error(error?.message || "Failed to submit form.")
    }
  }


  if (sections.length === 0 || allFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No fields added yet. Go to the Design tab to add form fields.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
        
        {isPreview && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📋 Preview Mode - Form submissions will not be saved
            </p>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="space-y-6">
              {/* Section Header */}
              <div className="space-y-4">
                {section.image && (
                  <div className="w-full">
                    <PreviewableImage
                      image={section.image}
                      alt={section.name}
                      className="w-full max-h-48 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">{section.name}</h2>
                  {section.description && <p className="text-gray-600">{section.description}</p>}
                </div>
              </div>

              {/* Section Fields */}
              <div className="space-y-6">
                {section.fields.map((field) => {
                  return (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.name} // Use the backend-generated unique name
                      render={({ field: formField }) => (
                        <FormItem className="space-y-3">
                          {field.image && (
                            <div className="w-full">
                              <PreviewableImage
                                image={field.image}
                                alt={field.label}
                                className="w-full max-h-48 object-cover rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                          <FormLabel className="flex items-center gap-1 text-base">
                            {field.label}
                            {field.isRequired && <span className="text-red-500">*</span>}
                          </FormLabel>
                          <FormControl>
                            {field.type === "textarea" ? (
                              <Textarea 
                                placeholder={field.placeholder} 
                                rows={field.rows || 3} 
                                {...formField} 
                              />
                            ) : field.type === "select" ? (
                              <Select onValueChange={formField.onChange} value={formField.value || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option, index) => (
                                    <SelectItem key={index} value={option.value || option.label}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : field.type === "radio" ? (
                              <RadioGroup onValueChange={formField.onChange} value={formField.value || ""}>
                                {field.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem 
                                      value={option.value || option.label} 
                                      id={`${field.name}-${index}`} 
                                    />
                                    <Label htmlFor={`${field.name}-${index}`}>{option.label}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            ) : field.type === "checkbox" ? (
                              <div className="space-y-2">
                                {field.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${field.name}-${index}`}
                                      checked={formField.value?.includes(option.value || option.label)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = formField.value || []
                                        const optionValue = option.value || option.label
                                        if (checked) {
                                          formField.onChange([...currentValue, optionValue])
                                        } else {
                                          formField.onChange(currentValue.filter((v: string) => v !== optionValue))
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`${field.name}-${index}`}>{option.label}</Label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                min={field.min}
                                max={field.max}
                                {...formField}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>

              {/* Section Separator */}
              {sectionIndex < sections.length - 1 && <Separator className="my-8" />}
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={submitForm.isPending}>
            {submitForm.isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  )
}


