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
import { useState } from "react"
import { toast } from "sonner"

interface DynamicFormProps {
  formId?: string
  sections: FormSection[]
  title: string
  description: string
  onSubmit?: (data: any) => void
}

function createFormSchema(sections: FormSection[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  sections.forEach((section) => {
    section.fields.forEach((field) => {
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

      if (field.required && field.type !== "checkbox") {
        fieldSchema = fieldSchema.min(1, "This field is required")
      }

      schemaFields[field.id] = fieldSchema
    })
  })

  return z.object(schemaFields)
}

export function DynamicForm({ formId, sections, title, description, onSubmit }: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const allFields = sections.flatMap((section) => section.fields)
  const schema = createFormSchema(sections)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: allFields.reduce(
      (acc, field) => {
        acc[field.id] = field.type === "checkbox" ? [] : field.defaultValue || ""
        return acc
      },
      {} as Record<string, any>,
    ),
  })

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (formId) {
        console.log("Form response submitted:", { formId, data })
        toast.success("Form submitted successfully!")
      } else {
        console.log("Preview form submitted:", data)
        toast.success("Form submitted successfully! (Preview mode)")
      }

      onSubmit?.(data)
      form.reset()
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
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
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-6">
              {/* Section Header */}
              <div className="space-y-4">
                {section.image && (
                  <div className="w-full">
                    <img
                      src={section.image || "/placeholder.svg"}
                      alt={section.title}
                      className="w-full max-h-64 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                  {section.description && <p className="text-gray-600">{section.description}</p>}
                </div>
              </div>

              {/* Section Fields */}
              <div className="space-y-6">
                {section.fields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem className="space-y-3">
                        {field.image && (
                          <div className="w-full">
                            <img
                              src={field.image || "/placeholder.svg"}
                              alt={field.label}
                              className="w-full max-h-48 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                        <FormLabel className="flex items-center gap-1 text-base">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea placeholder={field.placeholder} rows={field.rows || 3} {...formField} />
                          ) : field.type === "select" ? (
                            <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option, index) => (
                                  <SelectItem key={index} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "radio" ? (
                            <RadioGroup onValueChange={formField.onChange} defaultValue={formField.value}>
                              {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : field.type === "checkbox" ? (
                            <div className="space-y-2">
                              {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${field.id}-${index}`}
                                    checked={formField.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = formField.value || []
                                      if (checked) {
                                        formField.onChange([...currentValue, option])
                                      } else {
                                        formField.onChange(currentValue.filter((v: string) => v !== option))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
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
                ))}
              </div>

              {/* Section Separator */}
              {sectionIndex < sections.length - 1 && <Separator className="my-8" />}
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
