"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm } from "@/features/form-guard/components/form-builder/dynamic-form"
import { useFormBuilderStore, useFormLayout } from "@/features/form-guard/store/form-builder-store"
import { useLoaderData } from "react-router-dom"
import { LoaderData } from "./form-builder"
import { useEffect, useRef } from "react"

export const FormResponse = () => {
  const { formId, form } = useLoaderData() as LoaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Form Response</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicForm
            sections={form.sections}
            title={form.title}
            description={form.description ?? ""}
            onSubmit={(data) => {
              console.log("Form submitted:", data)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
