"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm } from "./dynamic-form"
import type { FormSection } from "@/types/form"

interface FormPreviewProps {
  formSections: FormSection[]
  formTitle: string
  formDescription: string
}

export function FormPreview({ formSections, formTitle, formDescription }: FormPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicForm
            sections={formSections}
            title={formTitle}
            description={formDescription}
            onSubmit={(data) => {
              console.log("Form submitted:", data)
              alert("Form submitted successfully! Check console for data.")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
