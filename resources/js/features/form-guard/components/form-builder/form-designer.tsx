"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldTypeSelector } from "./field-type-selector"
import { FieldEditor } from "./field-editor"
import { SectionEditor } from "./section-editor"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { FormSection, FormField, FieldType } from "@/types/form"
import { GripVertical, Trash2, Plus, FolderPlus, ImageIcon } from "lucide-react"
import { generateId } from "@/lib/utils"

interface FormDesignerProps {
  formSections: FormSection[]
  setFormSections: (sections: FormSection[]) => void
  formTitle: string
  setFormTitle: (title: string) => void
  formDescription: string
  setFormDescription: (description: string) => void
}

export function FormDesigner({
  formSections,
  setFormSections,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
}: FormDesignerProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // Auto-select first section when form loads
  useEffect(() => {
    if (formSections.length > 0 && !selectedSection && !selectedField) {
      setSelectedSection(formSections[0].id)
    }
  }, [formSections, selectedSection, selectedField])

  const addSection = () => {
    const newSection: FormSection = {
      id: generateId(),
      title: `Section ${formSections.length + 1}`,
      description: "",
      fields: [],
    }
    setFormSections([...formSections, newSection])
    setSelectedSection(newSection.id)
    setSelectedField(null)
  }

  const addField = (type: FieldType) => {
    // Use selected section, or default to first section if none selected
    const targetSectionId = selectedSection || formSections[0]?.id
    if (!targetSectionId) return

    const newField: FormField = {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: "",
      required: false,
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1"] : undefined,
    }

    setFormSections(
      formSections.map((section) =>
        section.id === targetSectionId ? { ...section, fields: [...section.fields, newField] } : section,
      ),
    )
    setSelectedField(newField.id)
    setSelectedSection(targetSectionId) // Keep the section selected
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormSections(
      formSections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
      })),
    )
  }

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setFormSections(formSections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)))
  }

  const deleteField = (fieldId: string) => {
    setFormSections(
      formSections.map((section) => ({
        ...section,
        fields: section.fields.filter((field) => field.id !== fieldId),
      })),
    )
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  const deleteSection = (sectionId: string) => {
    if (formSections.length <= 1) return // Keep at least one section
    setFormSections(formSections.filter((section) => section.id !== sectionId))
    if (selectedSection === sectionId) {
      setSelectedSection(null)
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Handle section reordering
    if (result.type === "SECTION") {
      const newSections = Array.from(formSections)
      const [reorderedSection] = newSections.splice(source.index, 1)
      newSections.splice(destination.index, 0, reorderedSection)
      setFormSections(newSections)
      return
    }

    // Handle field reordering within sections
    const sourceSectionIndex = formSections.findIndex((s) => s.id === source.droppableId)
    const destSectionIndex = formSections.findIndex((s) => s.id === destination.droppableId)

    if (sourceSectionIndex === -1 || destSectionIndex === -1) return

    const newSections = [...formSections]

    // Moving within the same section
    if (source.droppableId === destination.droppableId) {
      const fields = Array.from(newSections[sourceSectionIndex].fields)
      const [reorderedField] = fields.splice(source.index, 1)
      fields.splice(destination.index, 0, reorderedField)
      newSections[sourceSectionIndex] = { ...newSections[sourceSectionIndex], fields }
    } else {
      // Moving between sections
      const sourceFields = Array.from(newSections[sourceSectionIndex].fields)
      const destFields = Array.from(newSections[destSectionIndex].fields)
      const [movedField] = sourceFields.splice(source.index, 1)
      destFields.splice(destination.index, 0, movedField)

      newSections[sourceSectionIndex] = { ...newSections[sourceSectionIndex], fields: sourceFields }
      newSections[destSectionIndex] = { ...newSections[destSectionIndex], fields: destFields }
    }

    setFormSections(newSections)
  }

  const getSelectedField = () => {
    if (!selectedField) return null
    for (const section of formSections) {
      const field = section.fields.find((f) => f.id === selectedField)
      if (field) return field
    }
    return null
  }

  const getSelectedSection = () => {
    if (!selectedSection) return null
    return formSections.find((s) => s.id === selectedSection) || null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Settings and Sections */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Description</Label>
              <Textarea
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Form Sections
              <Button onClick={addSection} size="sm" variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections" type="SECTION">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {formSections.map((section, sectionIndex) => (
                      <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-lg p-4 bg-white"
                          >
                            {/* Section Header */}
                            <div
                              className={`flex items-center gap-3 mb-4 p-3 rounded cursor-pointer transition-colors ${
                                selectedSection === section.id
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                setSelectedSection(section.id)
                                setSelectedField(null)
                              }}
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{section.title}</span>
                                  {section.image && <ImageIcon className="h-4 w-4 text-blue-500" />}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addField("text")
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSection(section.id)
                                }}
                                disabled={formSections.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Section Fields */}
                            <Droppable droppableId={section.id} type="FIELD">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2 min-h-[50px]"
                                >
                                  {section.fields.map((field, fieldIndex) => (
                                    <Draggable key={field.id} draggableId={field.id} index={fieldIndex}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`p-3 border rounded cursor-pointer transition-colors ${
                                            selectedField === field.id
                                              ? "border-blue-500 bg-blue-50"
                                              : "border-gray-200 hover:border-gray-300 bg-white"
                                          }`}
                                          onClick={() => {
                                            setSelectedField(field.id)
                                            setSelectedSection(null)
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">{field.label}</span>
                                                {field.image && <ImageIcon className="h-4 w-4 text-blue-500" />}
                                              </div>
                                              <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                deleteField(field.id)
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {section.fields.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                                      No fields in this section. Add fields using the panel on the right.
                                    </div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        <FieldTypeSelector
          onAddField={addField}
          targetSection={
            selectedSection
              ? formSections.find((s) => s.id === selectedSection)?.title
              : formSections[0]?.title || "No sections available"
          }
        />

        {selectedField && (
          <FieldEditor field={getSelectedField()!} onUpdate={(updates) => updateField(selectedField, updates)} />
        )}

        {selectedSection && (
          <SectionEditor
            section={getSelectedSection()!}
            onUpdate={(updates) => updateSection(selectedSection, updates)}
          />
        )}
      </div>
    </div>
  )
}
