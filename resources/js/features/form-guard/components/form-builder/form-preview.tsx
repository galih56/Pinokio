"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm } from "./dynamic-form"
import { useFormLayout } from "../../store/form-builder-store"
import { ErrorBoundary } from "react-error-boundary"
import { FormErrorFallback } from "./form-error-boundary"
import { Form } from "@/types/form"

export function FormPreview() {
  const { formTitle, formDescription, formSections } = useFormLayout()

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          
          <ErrorBoundary
            FallbackComponent={FormErrorFallback}
            onError={(error, errorInfo) => {
              console.error("Form error boundary caught an error:", error, errorInfo)
            }}
            resetKeys={[formSections, formTitle]}
          >
            <DynamicForm
              formData={{
                title : formTitle,
                description : formDescription?? "",
                sections : formSections
              } as Form}
              onSubmit={(data) => {
                console.log("Form submitted:", data)
              }}
            />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  )
}
