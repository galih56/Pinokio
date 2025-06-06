import { create } from "zustand"
import { devtools, persist, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { useShallow } from "zustand/react/shallow"
import type { FormSection, FormField, FieldType } from "@/types/form"
import { generateId } from "@/lib/utils"

interface FormBuilderState {
  // Current form being edited
  formId?: string
  formTitle: string
  formDescription?: string
  formSections: FormSection[]

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
}

interface FormBuilderSnapshot {
  formTitle: string
  formDescription: string
  formSections: FormSection[]
  timestamp: Date
}

const createInitialSection = (): FormSection => ({
  id: generateId(),
  title: "Section 1",
  description: "",
  fields: [],
})

const createSnapshot = (state: FormBuilderState): FormBuilderSnapshot => ({
  formTitle: state.formTitle,
  formDescription: state.formDescription,
  formSections: JSON.parse(JSON.stringify(state.formSections)),
  timestamp: new Date(),
})

export const useFormBuilderStore = create<FormBuilderState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          formTitle: "Untitled Form",
          formDescription: "",
          formSections: [createInitialSection()],
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
              }
            }),

          setFormDescription: (description) =>
            set((state) => {
              if (state.formDescription !== description) {
                state.formDescription = description
                state.isDirty = true
              }
            }),

          // Section actions
          addSection: () =>
            set((state) => {
              const newSection: FormSection = {
                id: generateId(),
                title: `Section ${state.formSections.length + 1}`,
                description: "",
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
              state.isDirty = true
            }),

          reorderSections: (startIndex, endIndex) =>
            set((state) => {
              const [removed] = state.formSections.splice(startIndex, 1)
              state.formSections.splice(endIndex, 0, removed)
              state.isDirty = true
            }),

          // Field actions
          addField: (sectionId, type) =>
            set((state) => {
              const section = state.formSections.find((s) => s.id === sectionId)
              if (!section) return

              const newField: FormField = {
                id: generateId(),
                type,
                label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
                placeholder: "",
                required: false,
                options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1"] : undefined,
              }

              section.fields.push(newField)
              state.selectedFieldId = newField.id
              state.selectedSectionId = sectionId
              state.isDirty = true
            }),

          updateField: (fieldId, updates) =>
            set((state) => {
              for (const section of state.formSections) {
                const field = section.fields.find((f) => f.id === fieldId)
                if (field) {
                  Object.assign(field, updates)
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

              const [field] = fromSection.fields.splice(fieldIndex, 1)
              toSection.fields.splice(toIndex, 0, field)
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

// Stable selectors using useShallow to prevent unnecessary re-renders
export const useFormLayout = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      formId: state.formId,
      formTitle: state.formTitle,
      formDescription: state.formDescription,
      formSections: state.formSections,
    }))
  )

export const useFormSelection = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      selectedFieldId: state.selectedFieldId,
      selectedSectionId: state.selectedSectionId,
    }))
  )

export const useFormStatus = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      isDirty: state.isDirty,
      isAutoSaving: state.isAutoSaving,
      lastSaved: state.lastSaved,
    }))
  )

export const useFormHistory = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      canUndo: state.canUndo(),
      canRedo: state.canRedo(),
      undo: state.undo,
      redo: state.redo,
    }))
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
    }))
  )

export const useFormSectionActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      addSection: state.addSection,
      updateSection: state.updateSection,
      deleteSection: state.deleteSection,
      reorderSections: state.reorderSections,
    }))
  )

export const useFormFieldActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      addField: state.addField,
      updateField: state.updateField,
      deleteField: state.deleteField,
      moveField: state.moveField,
    }))
  )

export const useFormSelectionActions = () =>
  useFormBuilderStore(
    useShallow((state) => ({
      selectField: state.selectField,
      selectSection: state.selectSection,
      clearSelection: state.clearSelection,
    }))
  )
