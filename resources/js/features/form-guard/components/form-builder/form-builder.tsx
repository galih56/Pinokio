"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Settings, Save, Loader2, Undo, Redo } from "lucide-react"
import { toast } from "sonner"
import { useFormBuilderStore, useFormTemplate, useFormHistory, useFormStatus } from "../../store/form-builder-store"
import { useGetFormTemplate } from "../../api/use-get-form-template"
import { FormPreview } from "./form-preview"
import { FormDesigner } from "./form-designer"
import { useUpdateFormTemplate } from "../../api/update-form-template"
import { useCreateFormTemplate } from "../../api/create-form-template"
import { AxiosError } from "axios"

interface FormBuilderProps {
  formId: string
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const { formTitle, formDescription, formSections } = useFormTemplate()
  const { isDirty, isAutoSaving } = useFormStatus()
  const { canUndo, canRedo, undo, redo } = useFormHistory()
  const { setFormData, markClean, saveSnapshot, setAutoSaving } = useFormBuilderStore()

  const { data: formTemplate, isLoading: isLoadingTemplate } = useGetFormTemplate({
    formId,
    queryConfig: {
      enabled: !!formId,
      onSuccess: (data : any) => {
        if (data) {
          setFormData({
            formId,
            title: data.title,
            description: data.description || "",
            sections: data.sections || [],
          })
        }
      },
      onError: (error : AxiosError) => {
        toast.error("Failed to load form template")
        console.error("Error loading form template:", error)
      },
    },
  })

  console.log(formId)

  // Create form template mutation
  const createTemplateMutation = useCreateFormTemplate({
    formId,
    mutationConfig: {
      onSuccess: () => {
        markClean()
        toast.success("Form template created successfully!")
      },
      onError: (error) => {
        toast.error("Failed to create form template")
        console.error("Error creating form template:", error)
      },
    },
  })

  // Update form template mutation
  const updateTemplateMutation = useUpdateFormTemplate({
    formId,
    mutationConfig: {
      onSuccess: () => {
        markClean()
        toast.success("Form template updated successfully!")
      },
      onError: (error) => {
        toast.error("Failed to update form template")
        console.error("Error updating form template:", error)
      },
    },
  })

  // Save snapshot for undo/redo when form changes
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        saveSnapshot()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isDirty, saveSnapshot])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            if (e.shiftKey) {
              e.preventDefault()
              redo()
            } else {
              e.preventDefault()
              undo()
            }
            break
          case "y":
            e.preventDefault()
            redo()
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  const handleSave = async () => {
    if (!isDirty) return

    try {
      setAutoSaving(true)

      const formData = {
        title: formTitle,
        description: formDescription,
        sections: formSections,
      }

      if (formTemplate) {
        // Update existing template
        updateTemplateMutation.mutate(formData)
      } else {
        // Create new template
        createTemplateMutation.mutate(formData)
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save form template")
    } finally {
      setAutoSaving(false)
    }
  }

  const isSaving = isAutoSaving || createTemplateMutation.isPending || updateTemplateMutation.isPending

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{formTemplate ? "Edit Form Template" : "Create Form Template"}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Build your form with drag-and-drop components</span>
            {isDirty && <span className="text-orange-600">• Unsaved changes</span>}
            {isSaving && <span className="text-blue-600">• Saving...</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo className="h-4 w-4" />
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="design" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6">
          <FormDesigner />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <FormPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
