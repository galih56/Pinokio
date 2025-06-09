"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { FileText, Settings, Zap } from "lucide-react"
import { MultiStepForm, Step } from "./multistep-form"

// Form data type
interface CreateFormData {
  title: string
  description: string
  provider: string
  formUrl?: string
  identifierLabel?: string
  identifierType?: string
  identifierDescription?: string
  proctored: boolean
  timeLimit?: number
  allowMultipleAttempts: boolean
}

// Steps configuration
const FORM_STEPS: Step[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Set up the basic details of your form",
    icon: FileText,
  },
  {
    id: 2,
    title: "Provider Configuration",
    description: "Configure your form provider and settings",
    icon: Settings,
  },
  {
    id: 3,
    title: "Advanced Settings",
    description: "Set up proctoring, time limits, and other options",
    icon: Zap,
    optional: true,
  },
]

interface CreateFormProps {
  onSuccess?: () => void
  onError?: () => void
}

export default function CreateForm({ onSuccess, onError }: CreateFormProps) {
  const form = useForm<CreateFormData>({
    defaultValues: {
      title: "",
      description: "",
      provider: "",
      formUrl: "",
      identifierLabel: "",
      identifierType: "",
      identifierDescription: "",
      proctored: false,
      timeLimit: undefined,
      allowMultipleAttempts: false,
    },
  })

  const { formData, updateFormData, handleSubmit, handleValidateStep, isSubmitting } = useMultiStepForm<CreateFormData>(
    {
      onSubmit: async (data) => {
        console.log("Submitting form:", data)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))
        onSuccess?.()
      },
      validateStep: async (stepIndex) => {
        const values = form.getValues()

        switch (stepIndex) {
          case 0: // Basic Information
            return !!(values.title && values.description)
          case 1: // Provider Configuration
            if (!values.provider) return false
            if (values.provider === "Google Form") {
              return !!(values.formUrl && values.identifierLabel && values.identifierType)
            }
            return true
          case 2: // Advanced Settings (optional)
            return true
          default:
            return true
        }
      },
    },
  )

  // Update form data when form values change
  const watchedValues = form.watch()

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 0:
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your form purpose and instructions"
                        rows={4}
                        onChange={(e) => {
                          field.onChange(e)
                          updateFormData({ description: e.target.value })
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

      case 1:
        return (
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Provider *</FormLabel>
                    <FormDescription>
                      You can integrate your Google Forms and set a timer and proctoring
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

              {form.watch("provider") === "Google Form" && (
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
                          This is used to sync Google Form responses. It helps Pinokio identify which record is filled
                          by whom
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
                              <SelectItem value="Free Text">Free Text</SelectItem>
                              <SelectItem value="Email">Email</SelectItem>
                              <SelectItem value="Number">Number</SelectItem>
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
                          Tell your respondents what they should fill in the Identifier Label
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
            </div>
          </Form>
        )

      case 2:
        return (
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="proctored"
                render={({ field }) => (
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
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <Card>
                      <CardContent className="flex flex-row items-center justify-between p-6">
                        <div className="space-y-0.5 flex-1">
                          <FormLabel className="text-base">Time Limit</FormLabel>
                          <FormDescription>
                            Your respondents will not be able to fill the form if the time is up
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="w-32">
                            <Input
                              type="number"
                              placeholder="Minutes"
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value ? Number.parseInt(e.target.value) : undefined
                                field.onChange(value)
                                updateFormData({ timeLimit: value })
                              }}
                            />
                          </div>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </FormItem>
                )}
              />

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

      default:
        return null
    }
  }

  return (
    <MultiStepForm
      steps={FORM_STEPS}
      onSubmit={handleSubmit}
      validateStep={handleValidateStep}
      isSubmitting={isSubmitting}
      onStepChange={(step, direction) => {
        console.log(`Moved to step ${step + 1} (${direction})`)
      }}
    >
      {(currentStep) => renderStepContent(currentStep)}
    </MultiStepForm>
  )
}
