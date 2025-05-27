"use client"
import { Input } from "@/components/ui/input"
import type { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNotifications } from "@/components/ui/notifications"
import { Textarea } from "@/components/ui/textarea"
import RichTextEditor from "@/components/ui/text-editor"
import { type CreateFormInput, createFormInputSchema, useCreateForm } from "../api/create-form"
import { Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { NumberInput } from "@/components/ui/number-input"
import { FileText, Settings, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MultiStepForm, type Step } from "@/components/layout/multistep-form/multistep-form"
import { useMultiStepForm } from "@/components/layout/multistep-form/use-multistep-form"
import { extractGoogleFormCode } from "@/lib/common"

// Editor extensions
const extensions = [
  StarterKit,
  Link.configure({
    autolink: true,
    openOnClick: true,
    linkOnPaste: true,
    shouldAutoLink: (url) => url.startsWith("https://") || url.startsWith("http://"),
  }),
]

type CreateFormType = {
  onSuccess?: Function
  onError?: Function
}

export default function CreateForm({ onSuccess, onError }: CreateFormType) {
  const { addNotification } = useNotifications()

  const { mutate: createFormMutation, isPending } = useCreateForm({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error: any) => {
        onError?.()
        if (error?.response?.data?.errors) {
          Object.keys(error.response.data.errors).forEach((field) => {
            form.setError(field as keyof CreateFormInput, {
              type: "manual",
              message: error.response.data.errors[field][0],
            })
          })
        }
      },
    },
  })

  const form = useForm<z.infer<typeof createFormInputSchema>>({
    resolver: zodResolver(createFormInputSchema),
  })

  const [editor] = useState(
    new Editor({
      extensions,
      content: "",
      editorProps: {
        attributes: {
          spellcheck: "false",
        },
      },
    }),
  )

  const formUrl = form.watch("formUrl")
  const selectedProvider = form.watch("provider")

  useEffect(() => {
    const code = extractGoogleFormCode(formUrl ?? "")
    if (code) {
      form.setValue("formCode", code)
    }
  }, [formUrl])

  useEffect(() => {
    const handleUpdate = () => {
      form.setValue("description", editor.getHTML(), { shouldValidate: true })
    }

    editor.on("update", handleUpdate)

    return () => {
      editor.off("update", handleUpdate)
      editor.destroy()
    }
  }, [editor, form])

  // Dynamic steps configuration with conditions
  const FORM_STEPS: Step[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Set up the basic details of your form",
      icon: FileText,
    },
    {
      id: 2,
      title: "Google Form Configuration",
      description: "Configure your Google Form integration settings",
      icon: Settings,
      condition: () => selectedProvider === "Google Form", // Only show for Google Form
    },
    {
      id: 3,
      title: "Advanced Settings",
      description: "Set up proctoring, time limits, and other options",
      icon: Zap,
      optional: true,
    },
  ]

  const { formData, updateFormData, handleSubmit, handleValidateStep, isSubmitting } = useMultiStepForm<
    z.infer<typeof createFormInputSchema>
  >({
    onSubmit: async (data) => {
      // Use the real API mutation instead of mock
      createFormMutation(data)
    },
    validateStep: async (stepIndex) => {
      const values = form.getValues()

      switch (stepIndex) {
        case 0: // Basic Information
          const step1Valid = await form.trigger(["title", "description", "provider"])
          if (!step1Valid) {
            addNotification({
              type: "error",
              title: "Please fill in all required fields",
              toast: true,
            })
          }
          return step1Valid
        case 1: // Google Form Configuration (only exists when Google Form is selected)
          if (values.provider === "Google Form") {
            const fieldsToValidate: (keyof CreateFormInput)[] = ["formUrl", "identifierLabel", "identifierType"]
            const step2Valid = await form.trigger(fieldsToValidate)
            if (!step2Valid) {
              addNotification({
                type: "error",
                title: "Please fill in all required Google Form fields",
                toast: true,
              })
            }
            return step2Valid
          }
          return true
        case 2: // Advanced Settings (optional)
          return true
        default:
          return true
      }
    },
  })

  const renderStepContent = (currentStep: number, goToStep: (step: number) => void, visibleSteps: Step[]) => {
    const currentStepId = visibleSteps[currentStep]?.id

    switch (currentStepId) {
      case 1: // Basic Information
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
                    <FormLabel>Description *</FormLabel>
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

      case 2: // Google Form Configuration
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
                      This is used to sync Google Form responses. It helps Pinokio identify which record is filled by
                      whom
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
          </Form>
        )

      case 3: // Advanced Settings
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
                            <NumberInput
                              {...field}
                              placeholder="Minutes"
                              onChange={(value) => {
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
      isSubmitting={isPending}
      onStepChange={(step, direction) => {
        console.log(`Moved to step ${step + 1} (${direction})`)
      }}
    >
      {renderStepContent}
    </MultiStepForm>
  )
}
