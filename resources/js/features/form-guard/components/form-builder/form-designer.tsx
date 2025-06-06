"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldTypeSelector } from "./field-type-selector"
import { FieldEditor } from "./field-editor"
import { SectionEditor } from "./section-editor"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import type { FieldType } from "@/types/form"
import { GripVertical, Trash2, Plus, FolderPlus, ImageIcon } from "lucide-react"
import { useFormBuilderStore, useFormLayout, useFormSelection } from "../../store/form-builder-store"
import DialogOrDrawer from "@/components/layout/dialog-or-drawer"
import { useDisclosure } from "@/hooks/use-disclosure"

export function FormDesigner() {
  const { isOpen : isFieldTypeSelectorOpen, toggle : toggleFieldTypeSelector, open : openFieldTypeSelector, close : closeFieldTypeSelector } = useDisclosure();
  const { isOpen : isSectionEditorOpen, toggle : toggleSectionEditor, open : openSectionEditor, close : closeSectionEditor } = useDisclosure();
  const { isOpen : isFieldEditorOpen, toggle : toggleFieldEditor, open : openFieldEditor, close : closeFieldEditor } = useDisclosure();
  const { formTitle, formDescription, formSections } = useFormLayout()
  const { selectedFieldId, selectedSectionId } = useFormSelection()

  const {
    setFormTitle,
    setFormDescription,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    addField,
    updateField,
    deleteField,
    moveField,
    selectField,
    selectSection,
  } = useFormBuilderStore()

  const addFieldToSection = (type: FieldType) => {
    const targetSectionId = selectedSectionId || formSections[0]?.id
    if (targetSectionId) {
      addField(targetSectionId, type);
      closeFieldTypeSelector();
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Handle section reordering
    if (result.type === "SECTION") {
      reorderSections(source.index, destination.index)
      return
    }

    // Handle field reordering
    const sourceSection = formSections.find((s) => s.id === source.droppableId)
    const destSection = formSections.find((s) => s.id === destination.droppableId)

    if (!sourceSection || !destSection) return

    const fieldId = sourceSection.fields[source.index]?.id
    if (!fieldId) return

    moveField(fieldId, source.droppableId, destination.droppableId, destination.index)
  }

  const getSelectedField = () => {
    if (!selectedFieldId) return null
    for (const section of formSections) {
      const field = section.fields.find((f) => f.id === selectedFieldId)
      if (field) return field
    }
    return null
  }

  const getSelectedSection = () => {
    if (!selectedSectionId) return null
    return formSections.find((s) => s.id === selectedSectionId) || null
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
                                selectedSectionId === section.id
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                console.log("CHECK")
                                selectSection(section.id)
                                openSectionEditor();
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
                                  addField(section.id, "text");
                                  openFieldTypeSelector();
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
                                  closeSectionEditor();
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
                                            selectedFieldId === field.id
                                              ? "border-blue-500 bg-blue-50"
                                              : "border-gray-200 hover:border-gray-300 bg-white"
                                          }`}
                                          onClick={() => {
                                            selectField(field.id);
                                            openFieldEditor();
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
                                                closeFieldEditor();
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
        <DialogOrDrawer
            open={isFieldTypeSelectorOpen}
            onOpenChange={toggleFieldTypeSelector}
            title={"Add Field"}>
          <FieldTypeSelector
            onAddField={addFieldToSection}
            targetSection={
              selectedSectionId
                ? formSections.find((s) => s.id === selectedSectionId)?.title
                : formSections[0]?.title || "No sections available"
            }
          />
        </DialogOrDrawer>

        {(selectedFieldId && isFieldEditorOpen) && (
          <DialogOrDrawer
            open={isFieldEditorOpen}
            onOpenChange={toggleFieldEditor}
            title={"Edit Field"}>
            <FieldEditor field={getSelectedField()!} onUpdate={(updates) => updateField(selectedFieldId, updates)} />
          </DialogOrDrawer>
        )}

        {(selectedSectionId && isSectionEditorOpen) && (
          <DialogOrDrawer
            open={isSectionEditorOpen}
            onOpenChange={toggleSectionEditor}
            title={"Edit Section"}>
            <SectionEditor
              section={getSelectedSection()!}
              onUpdate={(updates) => updateSection(selectedSectionId, updates)}
            />
          </DialogOrDrawer>
        )}
      </div>
    </div>
  )
}
