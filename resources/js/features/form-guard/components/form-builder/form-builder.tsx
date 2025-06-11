"use client"

import { useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Settings, Save, Loader2, Undo, Redo } from "lucide-react"
import { toast } from "sonner"
import { useFormBuilderStore, useFormLayout, useFormHistory, useFormStatus, useFormActions, useFormErrors } from "../../store/form-builder-store"
import { useGetFormLayout } from "../../api/use-get-form-layout"
import { FormPreview } from "./form-preview"
import { FormDesigner } from "./form-designer"
import { useUpdateFormLayout } from "../../api/update-form-layout";
import { useCreateFormLayout } from "../../api/create-form-layout";
import { AxiosError } from "axios"
import { ErrorBoundary } from "react-error-boundary"
import { ComponentErrorFallback } from "@/components/layout/error-fallbacks"
import { Form } from "@/types/form"
import { apiErrorHandler } from "@/lib/utils"

interface FormBuilderProps {
  formId: string;
  initialData?: Form
}

export function FormBuilder({ formId, initialData }: FormBuilderProps) {
  const { formTitle, formDescription, formSections } = useFormLayout();
  const { isDirty, isAutoSaving } = useFormStatus()
  const { canUndo, canRedo, undo, redo } = useFormHistory()
  const { hasErrors, validateForm, clearErrors, setApiErrors } = useFormErrors();
  const { setFormData, markClean, saveSnapshot, setAutoSaving } = useFormBuilderStore()

  const dataInitializedRef = useRef(false)

  // Initialize from props if available (only once)
  useEffect(() => {
    if (initialData && !dataInitializedRef.current) {
      console.log("Initializing from props:", initialData)
      setFormData({
        formId,
        title: initialData.title,
        description: initialData.description || "",
        sections: initialData.sections || [],
      })
      dataInitializedRef.current = true
    }
  }, [initialData, formId, setFormData])

  const { data: formLayout, isLoading: isLoadingLayout } = useGetFormLayout({
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
        toast.error("Failed to load form layout")
        console.error("Error loading form layout:", error)
      },
    },
  })

  // Create form layout mutation
  const createLayoutMutation = useCreateFormLayout({
    formId,
    mutationConfig: {
      onSuccess: () => {
        markClean()
        toast.success("Form layout created successfully!")
      },
      onError: (error) => {
        toast.error("Failed to create form layout")
        console.error("Error creating form layout:", error)
      },
    },
  })

  // Update form layout mutation
  const updateLayoutMutation = useUpdateFormLayout({
    formId,
    mutationConfig: {
      onSuccess: () => {
        markClean()
        toast.success("Form layout updated successfully!")
      },
      onError: (error) => {
        toast.error("Failed to update form layout")
        console.error("Error updating form layout:", error)
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

    const isValid = validateForm()
    if (!isValid) {
      toast.error("Check your form layout")
      return
    }

    try {
      setAutoSaving(true)

      const formData = {
        title: formTitle,
        description: formDescription,
        sections: formSections,
      }

      if (formLayout) {
        // Update existing layout
        updateLayoutMutation.mutate(formData)
      } else {
        // Create new layout
        createLayoutMutation.mutate(formData)
      }
    } catch (error) {
      console.error("Save error:", error)

      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        setApiErrors(error.response.data.errors)
        apiErrorHandler(error, "form-builder")
      } else {
        apiErrorHandler(error, "form-builder")
      }
    } finally {
      setAutoSaving(false)
    }
  }

  const isSaving = isAutoSaving || createLayoutMutation.isPending || updateLayoutMutation.isPending

  if (isLoadingLayout) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form layout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{formLayout ? "Edit Form Layout" : "Create Form Layout"}</h1>
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
          <ErrorBoundary
            FallbackComponent={ComponentErrorFallback}
            resetKeys={[formId]}
          >
            <FormDesigner />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">          
          <ErrorBoundary
            FallbackComponent={ComponentErrorFallback}
            resetKeys={[formId]}
          >
            <FormPreview />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
