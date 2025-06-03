"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormDesigner } from "./form-designer"
import { FormPreview } from "./form-preview"
import { FormResponses } from "./form-responses"
import { Eye, Settings, BarChart3 } from "lucide-react"
import type { FormSection } from "@/types/form"
import { generateId } from "@/lib/utils"
import { Form } from "@/types/api"

type FormBuilderProps {
  form : Form
}

export function FormBuilder({ form } : FormBuilderProps) {
  const [formSections, setFormSections] = useState<FormSection[]>([
    {
      id: generateId(),
      title: "Section 1",
      description: "",
      fields: [],
    },
  ])
  const [formTitle, setFormTitle] = useState(form.title)
  const [formDescription, setFormDescription] = useState(form.description)

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6">
          <FormDesigner
            formSections={formSections}
            setFormSections={setFormSections}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <FormPreview formSections={formSections} formTitle={formTitle} formDescription={formDescription} />
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          <FormResponses formSections={formSections} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
