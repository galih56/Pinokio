"use client"

import { create } from "zustand"
import { devtools, persist, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { useShallow } from "zustand/react/shallow"
import {
  generateId,
  parseApiValidationErrors,
} from "@/lib/utils"
import { FormBuilderError, FormField, FormFieldOption, FormSection } from "@/types/form"

type FieldType = "text" | "email" | "number" | "textarea" | "select" | "radio" | "checkbox"

interface FormBuilderState {
  // Current form being edited
  formId?: string
  formTitle: string
  formDescription?: string
  formSections: FormSection[]

  // Error state
  errors: FormBuilderError[]
  hasErrors: boolean

  // UI state
  selectedFieldId?: string
  selectedSectionId?: string
  isDirty: boolean
  isAutoSaving: boolean
  lastSaved?: Date

  // History for undo/redo
  history: FormBuilderSnapshot[]
  historyIndex: number
  maxHistorySize: number

  // Actions
  setFormData: (data: { title: string; description: string; sections: FormSection[]; formId?: string }) => void
  setFormTitle: (title: string) => void
  setFormDescription: (description: string) => void

  // Error actions
  addError: (error: Omit<FormBuilderError, "id">) => void
  removeError: (errorId: string) => void
  clearErrors: () => void
  clearErrorsForField: (fieldId: string) => void
  clearErrorsForSection: (sectionId: string) => void
  setApiErrors: (apiErrors: Record<string, string[]>) => void
  validateForm: () => boolean
  getFieldErrors: (fieldId: string) => FormBuilderError[]
  getSectionErrors: (sectionId: string) => FormBuilderError[]
  hasFieldErrors: (fieldId: string) => boolean
  hasSectionErrors: (sectionId: string) => boolean

  // Section actions
  addSection: () => void
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void
  deleteSection: (sectionId: string) => void
  reorderSections: (startIndex: number, endIndex: number) => void

  // Field actions
  addField: (sectionId: string, type: FieldType) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  deleteField: (fieldId: string) => void
  moveField: (fieldId: string, fromSectionId: string, toSectionId: string, toIndex: number) => void

  // Option actions
  addFieldOption: (fieldId: string, label?: string) => void
  updateFieldOption: (fieldId: string, optionId: string, updates: Partial<Pick<FormFieldOption, 'label' | 'value'>>) => void
  removeFieldOption: (fieldId: string, optionId: string) => void
  reorderFieldOptions: (fieldId: string, oldIndex: number, newIndex: number) => void

  // Selection actions
  selectField: (fieldId: string) => void
  selectSection: (sectionId: string) => void
  clearSelection: () => void

  // History actions
  saveSnapshot: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Utility actions
  resetForm: () => void
  markClean: () => void
  setAutoSaving: (isAutoSaving: boolean) => void
  getFormDataForSubmission: () => any
}

interface FormBuilderSnapshot {
  formTitle: string
  formDescription: string
  formSections: FormSection[]
  timestamp: Date
}

const createInitialSection = (): FormSection => ({
  id: generateId("section"),
  label: "Section 1",
  description: "",
  fields: [],
  order: 0,
})

const createSnapshot = (state: FormBuilderState): FormBuilderSnapshot => ({
  formTitle: state.formTitle,
  formDescription: state.formDescription ?? "",
  formSections: JSON.parse(JSON.stringify(state.formSections)),
  timestamp: new Date(),
})

export const createOption = (label: string, value?: string): FormFieldOption => {
  const id = generateId("option")
  return ({
    id: id,
    label: label.trim(),
    value: value || id
  })
}

export const useFormBuilderStore = create<FormBuilderState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          formTitle: "Untitled Form",
          formDescription: "",
          formSections: [createInitialSection()],
          errors: [],
          hasErrors: false,
          isDirty: false,
          isAutoSaving: false,
          history: [],
          historyIndex: -1,
          maxHistorySize: 50,

          // Form data actions
          setFormData: (data) =>
            set((state) => {
              // Only update if data has actually changed to prevent unnecessary re-renders
              const hasChanged =
                state.formId !== data.formId ||
                state.formTitle !== data.title ||
                state.formDescription !== data.description ||
                JSON.stringify(state.formSections) !== JSON.stringify(data.sections)

              if (hasChanged) {
                state.formId = data.formId
                state.formTitle = data.title
                state.formDescription = data.description
                state.formSections = data.sections
                state.isDirty = false
                state.lastSaved = new Date()
                // Clear history when loading new form
                state.history = []
                state.historyIndex = -1
                // Clear errors when loading new form
                state.errors = []
                state.hasErrors = false
                // Auto-select first section
                if (data.sections.length > 0) {
                  state.selectedSectionId = data.sections[0].id
                  state.selectedFieldId = undefined
                }
              }
            }),

          setFormTitle: (title) =>
            set((state) => {
              if (state.formTitle !== title) {
                state.formTitle = title
                state.isDirty = true
                // Clear form-level title errors
                state.errors = state.errors.filter(
                  (error) => !(error.type === "form" && error.message.toLowerCase().includes("title")),
                )
                state.hasErrors = state.errors.length > 0
              }
            }),

          setFormDescription: (description) =>
            set((state) => {
              if (state.formDescription !== description) {
                state.formDescription = description
                state.isDirty = true
                // Clear form-level description errors
                state.errors = state.errors.filter(
                  (error) => !(error.type === "form" && error.message.toLowerCase().includes("description")),
                )
                state.hasErrors = state.errors.length > 0
              }
            }),

          // Error actions
          addError: (error) =>
            set((state) => {
              const newError: FormBuilderError = {
                ...error,
                id: generateId("error"),
              }
              state.errors.push(newError)
              state.hasErrors = true
            }),

          removeError: (errorId) =>
            set((state) => {
              state.errors = state.errors.filter((error) => error.id !== errorId)
              state.hasErrors = state.errors.length > 0
            }),

          clearErrors: () =>
            set((state) => {
              state.errors = []
              state.hasErrors = false
            }),

          clearErrorsForField: (fieldId) =>
            set((state) => {
              state.errors = state.errors.filter((error) => error.fieldId !== fieldId)
              state.hasErrors = state.errors.length > 0
            }),

          clearErrorsForSection: (sectionId) =>
            set((state) => {
              state.errors = state.errors.filter((error) => error.sectionId !== sectionId)
              state.hasErrors = state.errors.length > 0
            }),

          // Set API validation errors
          setApiErrors: (apiErrors) =>
            set((state) => {
              // Clear existing errors first
              state.errors = []

              // Parse and add API errors
              const parsedErrors = parseApiValidationErrors(apiErrors, state.formSections)
              state.errors = parsedErrors
              state.hasErrors = parsedErrors.length > 0
            }),

          validateForm: () => {
            const state = get()
            const errors: FormBuilderError[] = []

            // Validate form title
            if (!state.formTitle.trim()) {
              errors.push({
                id: generateId("error"),
                type: "form",
                message: "Form title is required",
              })
            }

            // Validate sections
            state.formSections.forEach((section) => {
              if (!section.label.trim()) {
                errors.push({
                  id: generateId("error"),
                  type: "section",
                  message: "Section label is required",
                  sectionId: section.id,
                })
              }

              if (section.fields.length === 0) {
                errors.push({
                  id: generateId("error"),
                  type: "section",
                  message: "Each section must have at least one field",
                  sectionId: section.id,
                })
              }

              // Validate fields
              section.fields.forEach((field) => {
                if (!field.label.trim()) {
                  errors.push({
                    id: generateId("error"),
                    type: "field",
                    message: "Field label is required",
                    fieldId: field.id,
                    sectionId: section.id,
                  })
                }

                // Enhanced validation for select/radio/checkbox options
                if (["select", "radio", "checkbox"].includes(field.type)) {
                  if (!field.options || field.options.length === 0) {
                    errors.push({
                      id: generateId("error"),
                      type: "field",
                      message: "Field must have at least one option",
                      fieldId: field.id,
                      sectionId: section.id,
                    })
                  } else {
                    // Validate individual options
                    const usedValues = new Set<string>()
                    const usedLabels = new Set<string>()
                    
                    field.options.forEach((option) => {
                      // Check empty labels
                      if (!option.label.trim()) {
                        errors.push({
                          id: generateId("error"),
                          type: "option",
                          message: "Option label cannot be empty",
                          fieldId: field.id,
                          sectionId: section.id,
                          optionId: option.id,
                        })
                      }
                      
                      // Check empty values
                      if (!option.value.trim()) {
                        errors.push({
                          id: generateId("error"),
                          type: "option",
                          message: "Option value cannot be empty",
                          fieldId: field.id,
                          sectionId: section.id,
                          optionId: option.id,
                        })
                      }
                      
                      // Check duplicate values
                      if (option.value.trim() && usedValues.has(option.value.trim())) {
                        errors.push({
                          id: generateId("error"),
                          type: "option",
                          message: `Duplicate option value: "${option.value}"`,
                          fieldId: field.id,
                          sectionId: section.id,
                          optionId: option.id,
                        })
                      }
                      usedValues.add(option.value.trim())
                      
                      // Check duplicate labels (warning)
                      if (option.label.trim() && usedLabels.has(option.label.trim())) {
                        errors.push({
                          id: generateId("error"),
                          type: "option",
                          message: `Duplicate option label: "${option.label}"`,
                          fieldId: field.id,
                          sectionId: section.id,
                          optionId: option.id,
                        })
                      }
                      usedLabels.add(option.label.trim())
                    })
                  }
                }
              })
            })

            set((state) => {
              state.errors = errors
              state.hasErrors = errors.length > 0
            })

            return errors.length === 0
          },

          getFieldErrors: (fieldId) => {
            return get().errors.filter((error) => error.fieldId === fieldId)
          },

          getSectionErrors: (sectionId) => {
            return get().errors.filter((error) => error.sectionId === sectionId)
          },

          hasFieldErrors: (fieldId) => {
            return get().errors.some((error) => error.fieldId === fieldId)
          },

          hasSectionErrors: (sectionId) => {
            return get().errors.some((error) => error.sectionId === sectionId)
          },

          // Section actions
          addSection: () =>
            set((state) => {
              const newSection: FormSection = {
                id: generateId("section"),
                label: `Section ${state.formSections.length + 1}`,
                description: "",
                order: state.formSections.length,
                fields: [],
              }
              state.formSections.push(newSection)
              state.selectedSectionId = newSection.id
              state.selectedFieldId = undefined
              state.isDirty = true
            }),

          updateSection: (sectionId, updates) =>
            set((state) => {
              const section = state.formSections.find((s) => s.id === sectionId)
              if (section) {
                Object.assign(section, updates)
                state.isDirty = true
                // Clear errors for this section if name was updated
                if (updates.label) {
                  state.errors = state.errors.filter(
                    (error) => !(error.sectionId === sectionId && error.message.toLowerCase().includes("label")),
                  )
                  state.hasErrors = state.errors.length > 0
                }
              }
            }),

          deleteSection: (sectionId) =>
            set((state) => {
              if (state.formSections.length <= 1) return

              state.formSections = state.formSections.filter((s) => s.id !== sectionId)
              if (state.selectedSectionId === sectionId) {
                state.selectedSectionId = state.formSections[0]?.id
                state.selectedFieldId = undefined
              }
              // Clear errors for deleted section
              state.errors = state.errors.filter((error) => error.sectionId !== sectionId)
              state.hasErrors = state.errors.length > 0
              state.isDirty = true
            }),

          reorderSections: (startIndex, endIndex) =>
            set((state) => {
              const [removed] = state.formSections.splice(startIndex, 1)
              state.formSections.splice(endIndex, 0, removed)

              // CRITICAL: Update order properties to match new positions
              state.formSections.forEach((section, index) => {
                section.order = index
              })

              state.isDirty = true
            }),

          // Field actions
          addField: (sectionId, type) =>
            set((state) => {
              const section = state.formSections.find((s) => s.id === sectionId)
              if (!section) return

              const newField: FormField = {
                id: generateId("field"),
                type,
                label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
                placeholder: "",
                isRequired: false,
                options: ["select", "radio", "checkbox"].includes(type) 
                  ? [
                      createOption("Option 1"),
                      createOption("Option 2")
                    ] 
                  : undefined,
              }

              section.fields.push(newField)
              state.selectedFieldId = newField.id
              state.selectedSectionId = sectionId
              state.isDirty = true

              // Clear section empty error if this was the first field
              if (section.fields.length === 1) {
                state.errors = state.errors.filter(
                  (error) => !(error.sectionId === sectionId && error.message.includes("at least one field")),
                )
                state.hasErrors = state.errors.length > 0
              }
            }),

          updateField: (fieldId, updates) =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field) {
                  Object.assign(field, updates)
                  state.isDirty = true
                  
                  // Clear errors for this field if label was updated
                  if (updates.label) {
                    state.errors = state.errors.filter(
                      (error) => !(error.fieldId === fieldId && error.message.toLowerCase().includes("label")),
                    )
                  }
                  
                  // Clear errors for this field if options were updated
                  if (updates.options) {
                    state.errors = state.errors.filter(
                      (error) => !(error.fieldId === fieldId && error.message.toLowerCase().includes("option")),
                    )
                  }
                  
                  state.hasErrors = state.errors.length > 0
                  break
                }
              }
            }),

          // Option actions
          addFieldOption: (fieldId, label = "New Option") =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field && field.options) {
                  const newOption = createOption(label)
                  field.options.push(newOption)
                  state.isDirty = true
                  
                  // Clear option-related errors for this field
                  state.errors = state.errors.filter(
                    (error) => !(error.fieldId === fieldId && error.message.toLowerCase().includes("option")),
                  )
                  state.hasErrors = state.errors.length > 0
                  break
                }
              }
            }),

          updateFieldOption: (fieldId, optionId, updates: Partial<Pick<FormFieldOption, 'label' | 'value'>>) =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field && field.options) {
                  const option = field.options.find((opt) => opt.id === optionId)
                  if (option) {
                    Object.assign(option, updates)
                    
                    // Auto-generate value if label was updated and no explicit value provided
                    if (updates.label && !updates.value) {
                      option.value = updates.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                    }
                    
                    state.isDirty = true
                    
                    // Clear option-related errors
                    state.errors = state.errors.filter(
                      (error) => !(
                        error.fieldId === fieldId && 
                        error.message.toLowerCase().includes("option")
                      ),
                    )
                    state.hasErrors = state.errors.length > 0
                    break
                  }
                }
              }
            }),

          removeFieldOption: (fieldId, optionId) =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field && field.options) {
                  const optionIndex = field.options.findIndex((opt) => opt.id === optionId)
                  if (optionIndex > -1) {
                    field.options.splice(optionIndex, 1)
                    state.isDirty = true
                    
                    // Remove errors related to this specific option
                    state.errors = state.errors.filter(
                      (error) => error.optionId !== optionId,
                    )
                    state.hasErrors = state.errors.length > 0
                    break
                  }
                }
              }
            }),

          reorderFieldOptions: (fieldId, oldIndex, newIndex) =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field && field.options) {
                  const [movedOption] = field.options.splice(oldIndex, 1)
                  field.options.splice(newIndex, 0, movedOption)
                  state.isDirty = true
                  break
                }
              }
            }),

          deleteField: (fieldId) =>
            set((state) => {
              for (const section of state.formSections) {
                const fieldIndex = section.fields.findIndex((f) => f.id === fieldId)
                if (fieldIndex !== -1) {
                  section.fields.splice(fieldIndex, 1)
                  if (state.selectedFieldId === fieldId) {
                    state.selectedFieldId = undefined
                  }
                  // Clear errors for deleted field
                  state.errors = state.errors.filter((error) => error.fieldId !== fieldId)
                  state.hasErrors = state.errors.length > 0
                  state.isDirty = true
                  break
                }
              }
            }),

          moveField: (fieldId, fromSectionId, toSectionId, toIndex) =>
            set((state) => {
              const fromSection = state.formSections.find((s) => s.id === fromSectionId)
              const toSection = state.formSections.find((s) => s.id === toSectionId)

              if (!fromSection || !toSection) return

              const fieldIndex = fromSection.fields.findIndex((f) => f.id === fieldId)
              if (fieldIndex === -1) return

              // Move the field
              const [field] = fromSection.fields.splice(fieldIndex, 1)
              toSection.fields.splice(toIndex, 0, field)

              // Update FormSectionId if moving between sections
              if (fromSectionId !== toSectionId) {
                field.FormSectionId = toSectionId
              }

              // CRITICAL: Update order properties for both sections
              fromSection.fields.forEach((f, index) => {
                f.order = index
                f.updatedAt = new Date()
              })

              toSection.fields.forEach((f, index) => {
                f.order = index
                f.updatedAt = new Date()
              })

              state.isDirty = true
            }),

          // Selection actions
          selectField: (fieldId) =>
            set((state) => {
              if (state.selectedFieldId !== fieldId) {
                state.selectedFieldId = fieldId
                state.selectedSectionId = undefined
              }
            }),

          selectSection: (sectionId) =>
            set((state) => {
              if (state.selectedSectionId !== sectionId) {
                state.selectedSectionId = sectionId
                state.selectedFieldId = undefined
              }
            }),

          clearSelection: () =>
            set((state) => {
              state.selectedFieldId = undefined
              state.selectedSectionId = undefined
            }),

          // History actions
          saveSnapshot: () =>
            set((state) => {
              const snapshot = createSnapshot(state)

              // Remove any history after current index (when undoing then making changes)
              state.history = state.history.slice(0, state.historyIndex + 1)

              // Add new snapshot
              state.history.push(snapshot)
              state.historyIndex = state.history.length - 1

              // Limit history size
              if (state.history.length > state.maxHistorySize) {
                state.history.shift()
                state.historyIndex--
              }
            }),

          undo: () =>
            set((state) => {
              if (state.historyIndex > 0) {
                state.historyIndex--
                const snapshot = state.history[state.historyIndex]
                state.formTitle = snapshot.formTitle
                state.formDescription = snapshot.formDescription
                state.formSections = JSON.parse(JSON.stringify(snapshot.formSections))
                state.isDirty = true
              }
            }),

          redo: () =>
            set((state) => {
              if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++
                const snapshot = state.history[state.historyIndex]
                state.formTitle = snapshot.formTitle
                state.formDescription = snapshot.formDescription
                state.formSections = JSON.parse(JSON.stringify(snapshot.formSections))
                state.isDirty = true
              }
            }),

          canUndo: () => get().historyIndex > 0,
          canRedo: () => get().historyIndex < get().history.length - 1,

          // Utility actions
          resetForm: () =>
            set((state) => {
              state.formId = undefined
              state.formTitle = "Untitled Form"
              state.formDescription = ""
              state.formSections = [createInitialSection()]
              state.selectedSectionId = state.formSections[0].id
              state.selectedFieldId = undefined
              state.errors = []
              state.hasErrors = false
              state.isDirty = false
              state.history = []
              state.historyIndex = -1
            }),

          markClean: () =>
            set((state) => {
              state.isDirty = false
              state.lastSaved = new Date()
            }),

          setAutoSaving: (isAutoSaving) =>
            set((state) => {
              if (state.isAutoSaving !== isAutoSaving) {
                state.isAutoSaving = isAutoSaving
              }
            }),

          // Helper function to get form data ready for server submission
          getFormDataForSubmission: () => {
            const state = get()
            return {
              title: state.formTitle,
              description: state.formDescription || '',
              sections: state.formSections.map((section, sectionIndex) => ({
                id: section.id,
                label: section.label,
                description: section.description || '',
                order: sectionIndex,
                fields: section.fields.map((field, fieldIndex) => ({
                  id: field.id,
                  type: field.type,
                  label: field.label,
                  placeholder: field.placeholder || '',
                  isRequired: field.isRequired,
                  order: fieldIndex,
                  options: field.options?.map((option, optionIndex) => ({
                    id: option.id,
                    label: option.label,
                    value: option.value,
                    order: optionIndex
                  })) || undefined
                }))
              }))
            }
          },
        })),
      ),
      {
        name: "form-builder-storage",
        partialize: (state) => ({
          // Only persist draft state
          formTitle: state.formTitle,
          formDescription: state.formDescription,
          formSections: state.formSections,
        }),
      },
    ),
    { name: "form-builder-store" },
  ),
)

// Updated selectors with option actions
export const useFormFieldActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      addField: state.addField,
      updateField: state.updateField,
      deleteField: state.deleteField,
      moveField: state.moveField,
      addFieldOption: state.addFieldOption,
      updateFieldOption: state.updateFieldOption,
      removeFieldOption: state.removeFieldOption,
      reorderFieldOptions: state.reorderFieldOptions,
    })),
  )

// Existing selectors remain the same...
export const useFormLayout = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      formId: state.formId,
      formTitle: state.formTitle,
      formDescription: state.formDescription,
      formSections: state.formSections,
    })),
  )

export const useFormSelection = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      selectedFieldId: state.selectedFieldId,
      selectedSectionId: state.selectedSectionId,
    })),
  )

export const useFormStatus = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      isDirty: state.isDirty,
      isAutoSaving: state.isAutoSaving,
      lastSaved: state.lastSaved,
    })),
  )

export const useFormErrors = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      errors: state.errors,
      hasErrors: state.hasErrors,
      addError: state.addError,
      removeError: state.removeError,
      clearErrors: state.clearErrors,
      clearErrorsForField: state.clearErrorsForField,
      clearErrorsForSection: state.clearErrorsForSection,
      setApiErrors: state.setApiErrors,
      validateForm: state.validateForm,
      getFieldErrors: state.getFieldErrors,
      getSectionErrors: state.getSectionErrors,
      hasFieldErrors: state.hasFieldErrors,
      hasSectionErrors: state.hasSectionErrors,
    })),
  )

export const useFormHistory = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      canUndo: state.canUndo(),
      canRedo: state.canRedo(),
      undo: state.undo,
      redo: state.redo,
    })),
  )

// Additional convenience selectors
export const useFormActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      setFormData: state.setFormData,
      setFormTitle: state.setFormTitle,
      setFormDescription: state.setFormDescription,
      addSection: state.addSection,
      updateSection: state.updateSection,
      deleteSection: state.deleteSection,
      reorderSections: state.reorderSections,
      addField: state.addField,
      updateField: state.updateField,
      deleteField: state.deleteField,
      moveField: state.moveField,
      selectField: state.selectField,
      selectSection: state.selectSection,
      clearSelection: state.clearSelection,
      saveSnapshot: state.saveSnapshot,
      resetForm: state.resetForm,
      markClean: state.markClean,
      setAutoSaving: state.setAutoSaving,
      getFormDataForSubmission: state.getFormDataForSubmission,
    })),
  )

export const useFormSectionActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      addSection: state.addSection,
      updateSection: state.updateSection,
      deleteSection: state.deleteSection,
      reorderSections: state.reorderSections,
    })),
  )

export const useFormSelectionActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      selectField: state.selectField,
      selectSection: state.selectSection,
      clearSelection: state.clearSelection,
    })),
  )

// New option-specific selector
export const useFormOptionActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      addFieldOption: state.addFieldOption,
      updateFieldOption: state.updateFieldOption,
      removeFieldOption: state.removeFieldOption,
      reorderFieldOptions: state.reorderFieldOptions,
    })),
  )
