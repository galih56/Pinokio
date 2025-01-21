import { clsx, type ClassValue } from "clsx"
import { FieldErrors } from "react-hook-form";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasErrorsInTab(errors: FieldErrors, fieldNames: string[]) {
  return fieldNames.some((fieldName) => errors[fieldName]);
}