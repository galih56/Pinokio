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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
      const fieldKey = field.id

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
  isPreview = false,
}: DynamicFormProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [formProgress, setFormProgress] = useState(0)

  const hasValidationErrors =
    !sections || sections.length === 0 || sections.flatMap((section) => section?.fields || []).length === 0

  const allFields = useMemo(() => {
    try {
      return sections?.flatMap((section) => section?.fields || []) || []
    } catch (error) {
      console.error("Error processing form data:", error)
      return []
    }
  }, [sections])

  const schema = createFormSchema(sections)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: allFields.reduce(
      (acc, field) => {
        const fieldKey = field.id
        acc[fieldKey] = field.type === "checkbox" ? [] : field.defaultValue || ""
        return acc
      },
      {} as Record<string, any>,
    ),
    mode: "onChange",
  })

  const submitForm = useSubmitFormResponse({ formId: formHashId! })

  // Calculate form completion percentage
  const updateFormProgress = () => {
    const values = form.getValues()
    const totalFields = allFields.filter((field) => field.isRequired).length
    if (totalFields === 0) return 100

    const completedFields = allFields
      .filter((field) => field.isRequired)
      .filter((field) => {
        const value = values[field.id]
        return value !== undefined && value !== "" && value !== null && (Array.isArray(value) ? value.length > 0 : true)
      }).length

    return Math.round((completedFields / totalFields) * 100)
  }

  // Update progress when form values change
  useMemo(() => {
    const subscription = form.watch(() => {
      setFormProgress(updateFormProgress())
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

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

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (sections.length === 0 || allFields.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8 text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No fields added yet. Go to the Design tab to add form fields.</p>
        </CardContent>
      </Card>
    )
  }

  const currentSection = sections[currentSectionIndex]
  const isLastSection = currentSectionIndex === sections.length - 1
  const isFirstSection = currentSectionIndex === 0

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}

          {isPreview && (
            <Alert className="mt-2 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Preview Mode</AlertTitle>
              <AlertDescription className="text-blue-600">
                Form submissions will not be saved in preview mode
              </AlertDescription>
            </Alert>
          )}

          {sections.length > 1 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Form Progress</span>
                <span>{formProgress}% Complete</span>
              </div>
              <Progress value={formProgress} className="h-2" />

              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                {sections.map((section, index) => (
                  <Badge
                    key={section.id || index}
                    variant={index === currentSectionIndex ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap ${
                      index === currentSectionIndex ? "bg-primary" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setCurrentSectionIndex(index)}
                  >
                    {index + 1}. {section.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="p-6">
              <div key={currentSection.id || currentSectionIndex} className="space-y-6">
                {/* Section Header */}
                <div className="space-y-4">
                  {currentSection.image && (
                    <div className="w-full">
                      <PreviewableImage
                        image={currentSection.image}
                        alt={currentSection.label}
                        className="w-full max-h-64 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <span className="flex items-center justify-center bg-primary text-white rounded-full h-7 w-7 text-sm">
                        {currentSectionIndex + 1}
                      </span>
                      {currentSection.label}
                    </h2>
                    {currentSection.description && <p className="text-gray-600 pl-9">{currentSection.description}</p>}
                  </div>
                </div>

                {/* Section Fields */}
                <div className="space-y-8">
                  {currentSection.fields.map((field) => {
                    return (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={field.id}
                        render={({ field: formField }) => (
                          <FormItem className="space-y-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <div className="space-y-1">
                              <FormLabel className="flex items-center gap-1 text-base font-medium">
                                {field.label}
                                {field.isRequired && <span className="text-red-500">*</span>}
                              </FormLabel>
                              {field.placeholder && (
                                <FormDescription className="text-sm text-gray-500">{field.placeholder}</FormDescription>
                              )}
                            </div>

                            {field.image && (
                              <div className="w-full">
                                <PreviewableImage
                                  image={field.image}
                                  alt={field.label}
                                  className="w-full max-h-48 object-cover rounded-lg shadow-sm"
                                />
                              </div>
                            )}

                            <FormControl>
                              {field.type === "textarea" ? (
                                <Textarea
                                  placeholder={field.placeholder}
                                  rows={field.rows || 4}
                                  className="resize-y"
                                  {...formField}
                                />
                              ) : field.type === "select" ? (
                                <Select onValueChange={formField.onChange} value={formField.value || ""}>
                                  <SelectTrigger className="w-full">
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
                                <RadioGroup
                                  onValueChange={formField.onChange}
                                  value={formField.value || ""}
                                  className="space-y-3"
                                >
                                  {field.options?.map((option, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md border border-gray-100"
                                    >
                                      <RadioGroupItem
                                        value={option.value || option.label}
                                        id={`${field.id}-${index}`}
                                      />
                                      <Label htmlFor={`${field.id}-${index}`} className="flex-1 cursor-pointer">
                                        {option.label}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              ) : field.type === "checkbox" ? (
                                <div className="space-y-3">
                                  {field.options?.map((option, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md border border-gray-100"
                                    >
                                      <Checkbox
                                        id={`${field.id}-${index}`}
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
                                      <Label htmlFor={`${field.id}-${index}`} className="flex-1 cursor-pointer">
                                        {option.label}
                                      </Label>
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
                                  className="w-full"
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
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between p-6 bg-gray-50 border-t">
              {sections.length > 1 && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousSection}
                    disabled={isFirstSection}
                    className={isFirstSection ? "opacity-50" : ""}
                  >
                    Previous
                  </Button>

                  {!isLastSection && (
                    <Button type="button" onClick={goToNextSection}>
                      Next
                    </Button>
                  )}
                </div>
              )}

              {isLastSection && (
                <Button type="submit" className="w-full sm:w-auto" disabled={submitForm.isPending}>
                  {submitForm.isPending ? (
                    <>
                      <span className="animate-pulse mr-2">●</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Form
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
