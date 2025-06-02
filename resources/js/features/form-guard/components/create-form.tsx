"use client"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateFormInput, createFormInputSchema, useCreateForm } from "../api/create-form"
import { Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { useEffect, useState, useMemo } from "react"
import { FileText, Settings, Zap } from "lucide-react"
import { MultiStepForm, type Step } from "@/components/layout/multistep-form/multistep-form"
import { camelizeKeys } from "humps"
import { extractGoogleFormCode } from "@/lib/common"
import { useMultiStepForm } from "@/components/layout/multistep-form/use-multistep-form"
import { BasicInformationStep } from "./form-steps/basic-information"
import { GoogleFormConfigurationStep } from "./form-steps/google-configuration"
import { AdvancedSettingsStep } from "./form-steps/advanced-settings"
import { toast } from "sonner"

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

  const { mutate: createFormMutation, isPending } = useCreateForm({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error: any) => {
        onError?.()

        if (error?.response?.data?.errors) {
          // Convert snake_case error keys to camelCase using humps
          const camelCaseErrors = camelizeKeys(error.response.data.errors)

          // Set errors on the form
          Object.keys(camelCaseErrors).forEach((fieldName) => {
            const errorMessages = camelCaseErrors[fieldName]
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              form.setError(fieldName as keyof CreateFormInput, {
                type: "manual",
                message: errorMessages[0],
              })
            }
          })
        } else {
          toast.error("An error occurred")
        }
      },
    },
  })

  const form = useForm<z.infer<typeof createFormInputSchema>>({
    resolver: zodResolver(createFormInputSchema),
    defaultValues: {
      title: "",
      description: "",
      provider: 'Pinokio',
      accessType: undefined,
      formCode: "",
      formUrl: "",
      identifierLabel: "",
      identifierDescription: "",
      identifierType: undefined,
      timeLimit: undefined,
      allowMultipleAttempts: false,
      isActive: true,
      proctored: false,
    },
  })

  // Instantiate Editor outside of component state
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

  // Watch form values for conditional logic
  const formUrl = form.watch("formUrl")
  const selectedProvider = form.watch("provider")

  // Extract Google Form code when URL changes
  useEffect(() => {
    const code = extractGoogleFormCode(formUrl ?? "")
    if (code) {
      form.setValue("formCode", code)
    }
  }, [formUrl, form])

  // Sync editor content with form state
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
  const FORM_STEPS: Step[] = useMemo(
    () => [
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
        condition: () => selectedProvider === "Google Form",
      },
      {
        id: 3,
        title: "Advanced Settings",
        description: "Set up proctoring, time limits, and other options",
        icon: Zap,
        optional: true,
      },
    ],
    [selectedProvider],
  )

  // Multi-step form integration
  const { formData, updateFormData, handleSubmit, handleValidateStep, isSubmitting } = useMultiStepForm<
    z.infer<typeof createFormInputSchema>
  >({
    onSubmit: async (data) => {
      const formValues = form.getValues()
      createFormMutation(formValues)
    },
    validateStep: async (stepIndex, visibleSteps) => {
      const values = form.getValues()
      const currentStepId = visibleSteps[stepIndex]?.id

      switch (currentStepId) {
        case 1:
          const step1Valid = await form.trigger(["title", "description", "provider", "accessType"])
          if (!step1Valid) {
            toast.error("Please fill in all required fields")
          }
          return step1Valid
        case 2:
          if (values.provider === "Google Form") {
            const fieldsToValidate: (keyof CreateFormInput)[] = ["formUrl", "identifierLabel", "identifierType"]
            const step2Valid = await form.trigger(fieldsToValidate)
            if (!step2Valid) {
              toast.error("Please fill in all required Google Form fields")
            }
            return step2Valid
          }
          return true
        case 3:
          return true
        default:
          return true
      }
    },
  })

  const renderStepContent = (currentStep: number, goToStep: (step: number) => void, visibleSteps: Step[]) => {
    const currentStepId = visibleSteps[currentStep]?.id

    switch (currentStepId) {
      case 1:
        return <BasicInformationStep form={form} updateFormData={updateFormData} editor={editor} />
      case 2:
        return <GoogleFormConfigurationStep form={form} updateFormData={updateFormData} />
      case 3:
        return <AdvancedSettingsStep form={form} updateFormData={updateFormData} />
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
