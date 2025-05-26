"use client"

import { useState } from "react"

export interface UseMultiStepFormProps<T> {
  initialData?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  validateStep?: (stepIndex: number, data: T) => boolean | Promise<boolean>
}

export function useMultiStepForm<T extends Record<string, any>>({
  initialData = {},
  onSubmit,
  validateStep,
}: UseMultiStepFormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (stepData: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData as T)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleValidateStep = async (stepIndex: number) => {
    if (validateStep) {
      return await validateStep(stepIndex, formData as T)
    }
    return true
  }

  return {
    formData,
    updateFormData,
    handleSubmit,
    handleValidateStep,
    isSubmitting,
  }
}
