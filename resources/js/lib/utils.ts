import { clsx, type ClassValue } from "clsx"
import type { FieldErrors } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { FormBuilderError, FormSection } from "@/types/form"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBaseRoute = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean)
  return parts.length > 0 ? `/${parts[0]}` : "/"
}

export function hasErrorsInTab(errors: FieldErrors, fieldNames: string[]) {
  return fieldNames.some((fieldName) => errors[fieldName])
}

// Enhanced version for form builder errors
export function hasFormBuilderErrorsInSection(errors: FormBuilderError[], sectionId: string) {
  return errors.some((error) => error.sectionId === sectionId)
}

export function hasFormBuilderErrorsInField(errors: FormBuilderError[], fieldId: string) {
  return errors.some((error) => error.fieldId === fieldId)
}

// Group errors by type for better display
export function groupFormBuilderErrors(errors: FormBuilderError[]) {
  return {
    form: errors.filter((error) => error.type === "form"),
    sections: errors.filter((error) => error.type === "section"),
    fields: errors.filter((error) => error.type === "field"),
  }
}

// Get error severity level
export function getErrorSeverity(error: FormBuilderError): "low" | "medium" | "high" {
  if (error.type === "form") return "high"
  if (error.message.includes("required")) return "high"
  if (error.message.includes("at least one")) return "medium"
  return "low"
}

// Parse Laravel validation errors and convert to FormBuilderError format
export function parseApiValidationErrors(
  apiErrors: Record<string, string[]>,
  formSections: FormSection[],
): FormBuilderError[] {
  const errors: FormBuilderError[] = []

  Object.entries(apiErrors).forEach(([path, messages]) => {
    messages.forEach((message) => {
      const error = parseValidationPath(path, message, formSections)
      if (error) {
        errors.push({
          ...error,
          id: generateId("error"),
        })
      }
    })
  })

  return errors
}

// Parse Laravel validation path (e.g., "sections.1.fields", "sections.0.name")
function parseValidationPath(
  path: string,
  message: string,
  formSections: FormSection[],
): Omit<FormBuilderError, "id"> | null {
  const pathParts = path.split(".")

  // Handle form-level errors
  if (pathParts[0] === "title" || pathParts[0] === "description") {
    return {
      type: "form",
      message: `${pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)}: ${message}`,
    }
  }

  // Handle sections array errors
  if (pathParts[0] === "sections") {
    if (pathParts.length === 1) {
      // sections array itself
      return {
        type: "form",
        message: `Sections: ${message}`,
      }
    }

    const sectionIndex = Number.parseInt(pathParts[1])
    if (isNaN(sectionIndex) || !formSections[sectionIndex]) {
      return {
        type: "form",
        message: `Section error: ${message}`,
      }
    }

    const section = formSections[sectionIndex]

    // Handle section-level errors
    if (pathParts.length === 2) {
      return {
        type: "section",
        message,
        sectionId: section.id,
      }
    }

    // Handle section property errors (name, description, etc.)
    if (pathParts.length === 3) {
      const property = pathParts[2]
      if (property === "fields") {
        return {
          type: "section",
          message,
          sectionId: section.id,
        }
      } else {
        return {
          type: "section",
          message: `${property.charAt(0).toUpperCase() + property.slice(1)}: ${message}`,
          sectionId: section.id,
        }
      }
    }

    // Handle field-level errors
    if (pathParts.length >= 4 && pathParts[2] === "fields") {
      const fieldIndex = Number.parseInt(pathParts[3])
      if (isNaN(fieldIndex) || !section.fields[fieldIndex]) {
        return {
          type: "section",
          message: `Field error: ${message}`,
          sectionId: section.id,
        }
      }

      const field = section.fields[fieldIndex]

      if (pathParts.length === 4) {
        // fields array error
        return {
          type: "field",
          message,
          fieldId: field.id,
          sectionId: section.id,
        }
      }

      // Field property errors (label, type, etc.)
      const property = pathParts[4]
      return {
        type: "field",
        message: `${property.charAt(0).toUpperCase() + property.slice(1)}: ${message}`,
        fieldId: field.id,
        sectionId: section.id,
      }
    }
  }

  // Fallback for unrecognized paths
  return {
    type: "form",
    message: `${path}: ${message}`,
  }
}

// Enhanced API error handler with form builder specific handling
export const apiErrorHandler = (error: any, context?: "form-builder" | "general") => {
  type ToastType = "info" | "warning" | "success" | "error"

  const notify = (type: ToastType, title: string, message?: string) => {
    const options = {
      description: message,
    }

    switch (type) {
      case "success":
        toast.success(title, options)
        break
      case "error":
        console.log(type)
        toast.error(title, options)
        break
      case "warning":
        toast.warning(title, options)
        break
      case "info":
        toast.info(title, options)
        break
      default:
        toast(title, options)
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object"
  ) {
    const response = error.response as any
    const status = response.status
    const message = response.data?.message || response.data?.error || "Unknown error occurred"

    // Form builder specific error handling
    if (context === "form-builder") {
      switch (status) {
        case 400:
          notify("warning", "Form Validation Failed", "Please check your form structure and try again")
          break
        case 422:
          notify("error", "Form Structure Invalid", "Your form contains validation errors that need to be fixed")
          break
        default:
          // Fall through to general handling
          break
      }
    }

    switch (status) {
      case 400:
        notify("warning", "Bad Request", message)
        break
      case 401:
        notify("error", "Unauthorized", message)
        break
      case 403:
        notify("error", "Forbidden", message)
        break
      case 404:
        notify("error", "Not Found", message)
        break
      case 422:
        const errors = response.data?.errors
        if (errors && typeof errors === "object") {
          // Don't show individual field errors as toasts for form builder
          // They will be handled by the form builder error system
          if (context !== "form-builder") {
            Object.values(errors).forEach((err: any) => {
              const errMsg = Array.isArray(err) ? err.join(", ") : err
              notify("error", "Validation Error", errMsg)
            })
          }
        } else {
          notify("error", "Validation Error", message)
        }
        break
      case 500:
        notify("error", "Server Error", message)
        break
      default:
        notify("error", "Unhandled error", message)
    }
  } else if (error instanceof Error) {
    notify("error", "Unexpected Error", error.message)
  } else {
    notify("error", "Error", "An unknown error occurred.")
  }

  console.error("API Error:", error)
}

export function generateId(prefix = "", length = 10): string {
  return `${prefix ? prefix : nanoid(4)}_${nanoid(length)}`
}

// Form builder specific ID generators
export const generateFormId = () => generateId("form", 8)
export const generateSectionId = () => generateId("section", 8)
export const generateFieldId = () => generateId("field", 8)
export const generateErrorId = () => generateId("error", 6)
