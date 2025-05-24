export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "url"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  min?: number
  max?: number
  rows?: number
  image?: string
}

export interface FormSection {
  id: string
  title: string
  description?: string
  image?: string
  fields: FormField[]
}

export interface FormResponse {
  id: string
  submittedAt: string
  data: Record<string, any>
}
