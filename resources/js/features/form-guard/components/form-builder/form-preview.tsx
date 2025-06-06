"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm } from "./dynamic-form"
import { useFormLayout } from "../../store/form-builder-store"

export function FormPreview() {
  const { formTitle, formDescription, formSections } = useFormLayout()

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
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
