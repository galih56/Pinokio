"use client"

import { useState } from "react"
import { useDisclosure } from "@/hooks/use-disclosure"
import { useGetFormLink } from "@/features/form-guard/api/create-form-link"
import { Form } from "@/types/form"

export function useGetURLDialog() {
  const { isOpen, open, close } = useDisclosure()
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [url, setURL] = useState<string | null>(null)

  const getFormLinkMutation = useGetFormLink({
    mutationConfig: {
      onSuccess: (form) => {
        setURL(form.formUrl || null)
      },
    },
  })

  const handleGetURL = (form: Form) => {
    setSelectedForm(form)
    setURL(null)
    open()
  }

  const handleGetURLWithExpiry = (formId: string, expiresAt: Date | null, timeLimit?: number) => {
    getFormLinkMutation.mutate({
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
        setURL(null)
      }, 150)
    }
  }

  return {
    // State
    isOpen,
    selectedForm,
    url,
    isGenerating: getFormLinkMutation.isPending,

    // Actions
    handleGetURL,
    handleGetURLWithExpiry,
    handleDialogClose,

    // For manual control if needed
    open,
    close,
    setSelectedForm,
    setURL,
  }
}
