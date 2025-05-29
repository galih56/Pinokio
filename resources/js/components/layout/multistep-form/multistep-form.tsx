"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ReactNode, useState, useMemo } from "react"
import type { LucideIcon } from "lucide-react"

export interface Step {
  id: string | number
  title: string
  description: string
  icon?: LucideIcon
  optional?: boolean
  condition?: () => boolean // Add condition function
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
  getStepErrors?: (stepIndex: number, visibleSteps: Step[]) => string[] 
  children: (currentStep: number, goToStep: (step: number) => void, visibleSteps: Step[]) => ReactNode
}

export function MultiStepForm<T = any>({
  steps,
  onSubmit,
  onStepChange,
  validateStep,
  getStepErrors,
  isSubmitting = false,
  className = "",
  showStepIndicators = true,
  showProgress = true,
  children,
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({})

  // Filter steps based on conditions
  const visibleSteps = useMemo(() => {
    return steps.filter((step) => !step.condition || step.condition())
  }, [steps])

  // Update step errors when getStepErrors is provided
  const updateStepErrors = () => {
    if (getStepErrors) {
      const errors: Record<number, string[]> = {}
      visibleSteps.forEach((_, index) => {
        const stepErrorList = getStepErrors(index, visibleSteps)
        if (stepErrorList.length > 0) {
          errors[index] = stepErrorList
        }
      })
      setStepErrors(errors)
    }
  }

  // Update errors whenever we change steps or when component updates
  useMemo(() => {
    updateStepErrors()
  }, [visibleSteps, getStepErrors])

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < visibleSteps.length) {
      setCurrentStep(stepIndex)
    }
  }

  const nextStep = async () => {
    if (validateStep) {
      // Find the original step index for validation
      const originalStepIndex = steps.findIndex((step) => step.id === visibleSteps[currentStep].id)
      const isValid = await validateStep(originalStepIndex, {} as T)
      if (!isValid){ 
        updateStepErrors()
        return
      }
    }

    if (currentStep < visibleSteps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "next")
      updateStepErrors()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, "prev")
      updateStepErrors()
    }
  }

  const handleSubmit = async () => {
    if (validateStep) {
      const originalStepIndex = steps.findIndex((step) => step.id === visibleSteps[currentStep].id)
      const isValid = await validateStep(originalStepIndex, {} as T)
      if (!isValid) {
        updateStepErrors()
        return
      }
    }
    await onSubmit({} as T)
  }

  const progress = ((currentStep + 1) / visibleSteps.length) * 100
  const currentStepData = visibleSteps[currentStep]

  // Reset current step if it's beyond visible steps
  if (currentStep >= visibleSteps.length && visibleSteps.length > 0) {
    setCurrentStep(visibleSteps.length - 1)
  }

  return (
    <div className={`px-4 mx-auto ${className}`}>
      {/* Step Indicators */}
      {showStepIndicators && (
        <div className="flex items-center justify-center mb-6">
          {visibleSteps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === index
            const isCompleted = currentStep > index
            const hasErrors = stepErrors[index] && stepErrors[index].length > 0
            const isOptional = step.optional

            // Determine the step state and styling
            let stepClasses = ""
            let iconElement: ReactNode

            if (hasErrors && !isActive) {
              // Error state - red
              stepClasses = "border-destructive bg-destructive text-destructive-foreground"
              iconElement = <AlertCircle className="w-5 h-5" />
            } else if (isActive) {
              // Active state - primary color
              stepClasses = "border-primary bg-primary text-primary-foreground"
              iconElement = StepIcon ? (
                <StepIcon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )
            } else if (isCompleted) {
              // Completed state - primary color
              stepClasses = "border-primary bg-primary text-primary-foreground"
              iconElement = StepIcon ? <StepIcon className="w-5 h-5" /> : <span className="text-sm font-medium">✓</span>
            } else {
              // Default state - muted
              stepClasses = "border-muted-foreground bg-background text-muted-foreground"
              iconElement = StepIcon ? (
                <StepIcon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )
            }

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors cursor-pointer hover:opacity-80 ${stepClasses}`}
                    onClick={() => goToStep(index)}
                    title={hasErrors ? `Step has errors: ${stepErrors[index]?.join(", ")}` : step.title}
                  >
                    {iconElement}
                  </div>
                  {/* Step title and optional indicator */}
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium text-muted-foreground max-w-20 truncate">{step.title}</div>
                    {isOptional && <div className="text-xs text-muted-foreground/60">Optional</div>}
                    {hasErrors && (
                      <div className="text-xs text-destructive font-medium">
                        {stepErrors[index].length} error{stepErrors[index].length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-4 transition-colors ${
                      isCompleted ? "bg-primary" : hasErrors ? "bg-destructive/30" : "bg-muted"
                    }`}
                  />
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
            <h3 className="text-xl font-bold flex items-center gap-2">
              {currentStepData.title}
              {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && (
              <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium mb-1">Please fix the following errors:</p>
                <ul className="text-sm text-destructive space-y-1">
                  {stepErrors[currentStep].map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-destructive rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {visibleSteps.length}
          </div>
        </div>
        {showProgress && <Progress value={progress} className="w-full" />}
      </div>


      {/* Step Content */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="pr-4">{children(currentStep, goToStep, visibleSteps)}</div>
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
          {currentStep < visibleSteps.length - 1 ? (
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
