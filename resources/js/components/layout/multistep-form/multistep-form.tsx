"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ReactNode, useState } from "react"
import type { LucideIcon } from "lucide-react"

export interface Step {
  id: string | number
  title: string
  description: string
  icon?: LucideIcon
  optional?: boolean
}

export interface MultiStepFormProps<T = any> {
  steps: Step[]
  onSubmit: (data: T) => void | Promise<void>
  onStepChange?: (currentStep: number, direction: "next" | "prev") => void
  validateStep?: (stepIndex: number, data: T) => boolean | Promise<boolean>
  isSubmitting?: boolean
  className?: string
  showStepIndicators?: boolean
  showProgress?: boolean
  children: (currentStep: number, goToStep: (step: number) => void) => ReactNode
}

export function MultiStepForm<T = any>({
  steps,
  onSubmit,
  onStepChange,
  validateStep,
  isSubmitting = false,
  className = "",
  showStepIndicators = true,
  showProgress = true,
  children,
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0)

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }

  const nextStep = async () => {
    if (validateStep) {
      const isValid = await validateStep(currentStep, {} as T)
      if (!isValid) return
    }

    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "next")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "prev")
    }
  }

  const handleSubmit = async () => {
    if (validateStep) {
      const isValid = await validateStep(currentStep, {} as T)
      if (!isValid) return
    }
    await onSubmit({} as T)
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const currentStepData = steps[currentStep]

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Step Indicators */}
      {showStepIndicators && (
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === index
            const isCompleted = currentStep > index

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground bg-background text-muted-foreground"
                  }`}
                >
                  {StepIcon ? (
                    <StepIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 transition-colors ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Progress Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{currentStepData.title}</h3>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        {showProgress && <Progress value={progress} className="w-full" />}
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <ScrollArea className="max-h-[500px]">
            <div className="pr-4">{children(currentStep, goToStep)}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
