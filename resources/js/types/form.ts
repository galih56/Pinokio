
export interface Form {
  id: string;
  title: string;
  type: 'internal' | 'google';
  formCode?: string;
  provider: 'Pinokio' | 'Google Form';
  formUrl?: string;
  description?: string;
  requiresToken: boolean;
  requiresIdentifier: boolean;
  identifierLabel?: string;
  identifierDescription?: string;
  identifierType?: string;
  timeLimit: number;
  allowMultipleAttempts: boolean;
  proctored: boolean;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  sections : Array<FormSection>
}

export interface FormSection {
  id: string;
  label: string;
  description?: string;
  displayImage?: string | File; 
  newImage?: string | File; 
  order: number;
  fields: Array<FormField>;
}

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
  id: string;
  formSectionId?: string;
  fieldTypeId?: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  isRequired: boolean;
  displayImage?: string | File; 
  newImage?: string | File; 
  order: number;
  createdAt?: Date;
  updatedAt?: Date;

  options?: FormFieldOption[];
}

export interface FormFieldOption {
  id: string;
  formFieldId?: string;
  label: string;
  value: string;
}

export interface FormToken {
  id: string;
  formId: string;
  token: string;
  identifier?: string;
  openTime?: string;
  submittedTime?: string;
  isUsed: boolean;
  expiresAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormAttempt {
  id: string;
  formId: string;
  tokenId?: number;
  identifier?: string;
  startedAt: Date;
  submittedAt?: string;
  isValid: boolean;
  durationSeconds?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedBy?: number;
  submittedAt: Date;
}

export interface FormEntry {
  id: string;
  formSubmissionId: string;
  formFieldId: string;
  value: any;
}

export interface FormResponse {
  id: string
  submittedAt: string
  data: Record<string, any>
}

export interface FormBuilderError {
  id: string
  type: "section" | "field" | "form" | "option"
  message: string
  fieldId?: string
  sectionId?: string
  severity?: "low" | "medium" | "high"
}
