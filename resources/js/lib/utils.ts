import { clsx, type ClassValue } from "clsx"
import { FieldErrors } from "react-hook-form";
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid'
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBaseRoute = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : "/";
};

export function hasErrorsInTab(errors: FieldErrors, fieldNames: string[]) {
  return fieldNames.some((fieldName) => errors[fieldName]);
}

export const apiErrorHandler = (error: any) => {
  type ToastType = "info" | "warning" | "success" | "error";

  const notify = (type: ToastType, title: string, message?: string) => {
    const options = {
      description: message,
    };

    switch (type) {
      case "success":
        toast.success(title, options);
        break;
      case "error":
        console.log(type)

        toast.error(title, options);
        break;
      case "warning":
        toast.warning(title, options);
        break;
      case "info":
        toast.info(title, options);
        break;
      default:
        toast(title, options);
    }
  };

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    error.response &&
    typeof error.response === "object"
  ) {
    const response = error.response as any;
    const status = response.status;
    const message =
      response.data?.message ||
      response.data?.error ||
      "Unknown error occurred";

    switch (status) {
      case 400:
        notify("warning", "Bad Request", message);
        break;
      case 401:
        notify("error", "Unauthorized", message);
        break;
      case 403:
        notify("error", "Forbidden", message);
        break;
      case 404:
        notify("error", "Not Found", message);
        break;
      case 422:
        const errors = response.data?.errors;
        if (errors && typeof errors === "object") {
          Object.values(errors).forEach((err: any) => {
            const errMsg = Array.isArray(err) ? err.join(", ") : err;
            notify("error", "Validation Error", errMsg);
          });
        } else {
          notify("error", "Validation Error", message);
        }
        break;
      case 500:
        notify("error", "Server Error", message);
        break;
      default:
        notify("error", "Unhandled error", message);
    }
  } else if (error instanceof Error) {
    notify("error", "Unexpected Error", error.message);
  } else {
    notify("error", "Error", "An unknown error occurred.");
  }

  console.error("API Error:", error);
};


export function generateId(): string {
  const id = nanoid(6); 
  return `field-${id}`
}
