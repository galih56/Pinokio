"use client"

import { useState } from "react"
import { useDisclosure } from "@/hooks/use-disclosure"
import { useGenerateFormLink } from "@/features/form-guard/api/create-form-link"
import { Form } from "@/types/form"

export function useGenerateLinkDialog() {
  const { isOpen, open, close } = useDisclosure()
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const generateFormLinkMutation = useGenerateFormLink({
    mutationConfig: {
      onSuccess: (form) => {
        setGeneratedLink(form.formUrl || null)
      },
    },
  })

  const handleGenerateLink = (form: Form) => {
    setSelectedForm(form)
    setGeneratedLink(null)
    open()
  }

  const handleGenerateLinkWithExpiry = (formId: string, expiresAt: Date | null, timeLimit?: number) => {
    generateFormLinkMutation.mutate({
      formId,
      expiresAt,
      timeLimit,
    })
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      close()
      // Reset state when closing
      setTimeout(() => {
        setSelectedForm(null)
        setGeneratedLink(null)
      }, 150)
    }
  }

  return {
    // State
    isOpen,
    selectedForm,
    generatedLink,
    isGenerating: generateFormLinkMutation.isPending,

    // Actions
    handleGenerateLink,
    handleGenerateLinkWithExpiry,
    handleDialogClose,

    // For manual control if needed
    open,
    close,
    setSelectedForm,
    setGeneratedLink,
  }
}
