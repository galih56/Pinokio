import { clsx, type ClassValue } from "clsx"
import type { FieldErrors } from "react-hook-form"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { FormBuilderError, FormSection } from "@/types/form";

import { format, isValid, parseISO, parse } from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import { z } from 'zod';

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

// Zod schemas for date validation
const dateSchemas = {
  // ISO date strings (YYYY-MM-DD or with time)
  isoDate: z.string().datetime().or(z.string().date()),
  
  // Common date formats
  usDate: z.string().regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/, 'Invalid US date format (MM/DD/YYYY)'),
  euDate: z.string().regex(/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Invalid EU date format (DD/MM/YYYY)'),
  hyphenDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Invalid date format (YYYY-MM-DD)'),
  
  // Flexible date string that tries multiple formats
  flexibleDate: z.string().refine((val) => {
    if (!val || val.trim() === '') return false;
    
    // Try parsing with different methods
    const parseAttempts = [
      () => parseISO(val),
      () => parse(val, 'yyyy-MM-dd', new Date()),
      () => parse(val, 'MM/dd/yyyy', new Date()),
      () => parse(val, 'dd/MM/yyyy', new Date()),
      () => parse(val, 'MM-dd-yyyy', new Date()),
      () => parse(val, 'dd-MM-yyyy', new Date()),
      () => parse(val, 'yyyy/MM/dd', new Date()),
      () => new Date(val) // Fallback to native parsing
    ];
    
    return parseAttempts.some(attempt => {
      try {
        const parsed = attempt();
        return parsed && isValid(parsed);
      } catch {
        return false;
      }
    });
  }, 'Invalid date format'),
  
  // Timestamp validation
  timestamp: z.number().int().positive().refine((val) => {
    // Validate timestamp is reasonable (after 1970, before 2100)
    const date = new Date(val);
    return date.getFullYear() >= 1970 && date.getFullYear() <= 2100;
  }, 'Invalid timestamp'),
  
  // Unix timestamp (seconds)
  unixTimestamp: z.number().int().positive().refine((val) => {
    const date = new Date(val * 1000);
    return date.getFullYear() >= 1970 && date.getFullYear() <= 2100;
  }, 'Invalid unix timestamp')
};

export const validateAndParseDate = (value: any): Date | null => {
  if (!value) return null;
  
  // Handle Date objects
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  
  // Handle numbers (timestamps)
  if (typeof value === 'number') {
    try {
      // Try as millisecond timestamp first
      const msResult = dateSchemas.timestamp.safeParse(value);
      if (msResult.success) {
        const date = new Date(value);
        return isValid(date) ? date : null;
      }
      
      // Try as unix timestamp (seconds)
      const unixResult = dateSchemas.unixTimestamp.safeParse(value);
      if (unixResult.success) {
        const date = new Date(value * 1000);
        return isValid(date) ? date : null;
      }
    } catch {
      return null;
    }
  }
  
  // Handle strings
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    
    // Try ISO date first (most reliable)
    try {
      const isoResult = dateSchemas.isoDate.safeParse(trimmed);
      if (isoResult.success) {
        const parsed = parseISO(trimmed);
        return isValid(parsed) ? parsed : null;
      }
    } catch {
      // Continue to other formats
    }
    
    // Try flexible date validation
    const flexResult = dateSchemas.flexibleDate.safeParse(trimmed);
    if (flexResult.success) {
      // Try parsing with different formats
      const parseAttempts = [
        () => parseISO(trimmed),
        () => parse(trimmed, 'yyyy-MM-dd', new Date()),
        () => parse(trimmed, 'MM/dd/yyyy', new Date()),
        () => parse(trimmed, 'dd/MM/yyyy', new Date()),
        () => parse(trimmed, 'MM-dd-yyyy', new Date()),
        () => parse(trimmed, 'dd-MM-yyyy', new Date()),
        () => parse(trimmed, 'yyyy/MM/dd', new Date())
      ];
      
      for (const attempt of parseAttempts) {
        try {
          const parsed = attempt();
          if (parsed && isValid(parsed)) {
            return parsed;
          }
        } catch {
          continue;
        }
      }
    }
  }
  
  return null;
};

// Helper function to check if a string is a valid date
export const isValidDateString = (dateString: string): boolean => {
  // Check for common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // ISO date (YYYY-MM-DD)
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
    /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or M/D/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY or M-D-YYYY
  ];
  
  return datePatterns.some(pattern => pattern.test(dateString));
};

// Helper function to format different data types
export const formatCellValue = (value: any, options?: {
  timezone?: string;
  maxStringLength?: number;
  emptyValueDisplay?: string;
  truncateText?: boolean;
  dateFormat?: string;
  datetimeFormat?: string;
}): string => {
  const {
    timezone,
    maxStringLength = 100,
    emptyValueDisplay = '-',
    truncateText = true,
    dateFormat = 'MMM d, yyyy',
    datetimeFormat = 'MMM d, yyyy HH:mm'
  } = options || {};

  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return emptyValueDisplay;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return emptyValueDisplay;
    return value.map(item => formatCellValue(item, options)).join(', ');
  }

  // Enhanced date handling with Zod validation
  const parsedDate = validateAndParseDate(value);
  if (parsedDate) {
    if (timezone) {
      const zonedDate = toZonedTime(parsedDate, timezone);
      return formatTz(zonedDate, datetimeFormat, { timeZone: timezone });
    }
    return format(parsedDate, datetimeFormat);
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Format large numbers with commas
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    // Format decimals to 2 places if they have decimals
    return value % 1 !== 0 ? value.toFixed(2) : value.toString();
  }

  // Handle objects (but not Date, which was handled above)
  if (typeof value === 'object' && value !== null) {
    // Handle common object patterns
    if ('name' in value) return String(value.name);
    if ('label' in value) return String(value.label);
    if ('title' in value) return String(value.title);
    if ('value' in value) return formatCellValue(value.value, options);
    
    // For complex objects, try to stringify in a readable way
    try {
      const stringified = JSON.stringify(value);
      // If it's too long, truncate it
      return truncateText && stringified.length > 50 ? stringified.substring(0, 47) + '...' : stringified;
    } catch {
      return '[Object]';
    }
  }

  // Handle strings (including stringified numbers, etc.)
  if (typeof value === 'string') {
    // Trim whitespace
    const trimmed = value.trim();
    if (trimmed === '') return emptyValueDisplay;
    
    // Handle long strings
    if (truncateText && trimmed.length > maxStringLength) {
      return trimmed.substring(0, maxStringLength - 3) + '...';
    }
    
    return trimmed;
  }

  // Fallback for any other types
  return String(value) || emptyValueDisplay;
};

// Specialized date formatting function with Zod validation
export const formatDateValue = (value: any, fieldType: string, timezone?: string): string => {
  if (!value) return '-';
  
  const parsedDate = validateAndParseDate(value);
  if (!parsedDate) return '-';
  
  const formatString = fieldType === 'datetime' ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy';
  
  if (timezone) {
    const zonedDate = toZonedTime(parsedDate, timezone);
    return formatTz(zonedDate, formatString, { timeZone: timezone });
  }
  
  return format(parsedDate, formatString);
};

export const createFieldValidationSchema = (fieldType: string) => {
  const baseSchemas = {
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, 'Invalid phone format').optional().or(z.literal('')),
    url: z.string().url().optional().or(z.literal('')),
    currency: z.number().positive().or(z.string().regex(/^\$?[\d,]+\.?\d{0,2}$/).transform(val => parseFloat(val.replace(/[$,]/g, '')))),
    percentage: z.number().min(0).max(100).or(z.number().min(0).max(1).transform(val => val * 100)),
    date: dateSchemas.flexibleDate.transform(validateAndParseDate).refine(val => val !== null, 'Invalid date'),
    datetime: dateSchemas.flexibleDate.transform(validateAndParseDate).refine(val => val !== null, 'Invalid datetime'),
    timestamp: dateSchemas.timestamp.transform(val => new Date(val)),
    integer: z.number().int().or(z.string().regex(/^\d+$/).transform(val => parseInt(val))),
    decimal: z.number().or(z.string().regex(/^\d*\.?\d+$/).transform(val => parseFloat(val))),
    boolean: z.boolean().or(z.string().transform(val => val.toLowerCase() === 'true' || val === '1')),
    json: z.string().transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON format'
        });
        return z.NEVER;
      }
    })
  };
  
  return baseSchemas[fieldType as keyof typeof baseSchemas] || z.any();
};

// Validation helper function
export const validateFieldValue = (value: any, fieldType?: string): { isValid: boolean; parsedValue: any; error?: string } => {
  if (!fieldType) {
    return { isValid: true, parsedValue: value };
  }
  
  try {
    const schema = createFieldValidationSchema(fieldType);
    const result = schema.safeParse(value);
    
    if (result.success) {
      return { isValid: true, parsedValue: result.data };
    } else {
      return { 
        isValid: false, 
        parsedValue: value, 
        error: result.error.errors[0]?.message || 'Validation failed' 
      };
    }
  } catch (error) {
    return { 
      isValid: false, 
      parsedValue: value, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
};

// Enhanced createFieldColumns function
export const createFieldColumns = (fieldsToDisplay: any[], options?: {
  timezone?: string;
  dateFormat?: string;
  datetimeFormat?: string;
  currencyCode?: string;
  maxStringLength?: number;
  emptyValueDisplay?: string;
  showValidationErrors?: boolean;
}) => {
  const {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat = 'MMM d, yyyy',
    datetimeFormat = 'MMM d, yyyy HH:mm',
    currencyCode = 'USD',
    maxStringLength = 100,
    emptyValueDisplay = '-',
    showValidationErrors = false
  } = options || {};

  const formatValue = (value: any, fieldType?: string): string => {
    if (value === null || value === undefined || value === '') {
      return emptyValueDisplay;
    }

    // Field-specific formatting
    if (fieldType) {
      switch (fieldType.toLowerCase()) {
        case 'currency':
        case 'money':
          if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: currencyCode 
            }).format(value);
          }
          // Try to parse string currency values
          if (typeof value === 'string') {
            const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(numericValue)) {
              return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: currencyCode 
              }).format(numericValue);
            }
          }
          return String(value);
        
        case 'percentage':
        case 'percent':
          if (typeof value === 'number') {
            // Assume values < 1 are decimals (0.5 = 50%), values >= 1 are already percentages
            const percentValue = value < 1 ? value * 100 : value;
            return `${percentValue.toFixed(1)}%`;
          }
          if (typeof value === 'string' && !value.includes('%')) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
              const percentValue = numericValue < 1 ? numericValue * 100 : numericValue;
              return `${percentValue.toFixed(1)}%`;
            }
          }
          return String(value);
        
        case 'date':
          return formatDateValue(value, 'date', timezone);
        
        case 'datetime':
        case 'timestamp':
          return formatDateValue(value, 'datetime', timezone);
        
        case 'time':
          if (value instanceof Date && isValid(value)) {
            return timezone ? 
              formatTz(toZonedTime(value, timezone), 'HH:mm', { timeZone: timezone }) :
              format(value, 'HH:mm');
          }
          // Handle time strings (HH:mm format)
          if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
            return value;
          }
          break;
        
        case 'boolean':
        case 'checkbox':
          if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
          }
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (['true', '1', 'yes', 'on'].includes(lowerValue)) return 'Yes';
            if (['false', '0', 'no', 'off'].includes(lowerValue)) return 'No';
          }
          break;
        
        case 'number':
        case 'integer':
        case 'decimal':
        case 'float':
          if (typeof value === 'number') {
            return fieldType === 'integer' ? 
              value.toLocaleString() : 
              value.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }
          break;
        
        case 'email':
          // Could add email validation styling or truncation here
          if (typeof value === 'string' && value.includes('@')) {
            return value;
          }
          break;
        
        case 'phone':
          // Could add phone number formatting here
          return String(value);
        
        case 'url':
        case 'link':
          // Could add link truncation or formatting here
          if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('www'))) {
            return maxStringLength && value.length > maxStringLength ? 
              value.substring(0, maxStringLength - 3) + '...' : value;
          }
          break;
        
        case 'textarea':
        case 'text':
        case 'string':
          // Apply text truncation for long text fields
          if (typeof value === 'string') {
            return maxStringLength && value.length > maxStringLength ? 
              value.substring(0, maxStringLength - 3) + '...' : value;
          }
          break;
      }
    }

    // Validate field value if showing validation errors
    if (showValidationErrors && fieldType) {
      const validation = validateFieldValue(value, fieldType);
      if (!validation.isValid) {
        return `❌ ${formatCellValue(value, { 
          timezone, 
          maxStringLength, 
          emptyValueDisplay 
        })}`;
      }
    }

    return formatCellValue(value, { 
      timezone, 
      maxStringLength, 
      emptyValueDisplay,
      dateFormat,
      datetimeFormat 
    });
  };

  return fieldsToDisplay.map((field) => ({
    id: field.id,
    header: field.label || field.name || 'Unnamed Field',
    accessorKey: field.id, // Add this for better table performance
    cell: ({ row }: { row: { original: any } }) => {
      const response = row.original;
      const value = response?.data?.[field.id];
      return formatValue(value, field.type);
    },
  }));
};
