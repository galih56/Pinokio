"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicForm } from "@/features/form-guard/components/form-builder/dynamic-form"
import { useLoaderData } from "react-router-dom"
import { LoaderData } from "./form-builder"
import { ErrorBoundary } from "react-error-boundary"
import { FormErrorFallback } from "@/features/form-guard/components/form-builder/form-error-boundary"
import { useGetFormLayout } from "@/features/form-guard/api/use-get-form-layout"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { Spinner } from "@/components/ui/spinner";


export const FormEntry = () => {
  const { formId } = useLoaderData() as { formId: string }; // Only get formId

  const { data, isPending, error} = useGetFormLayout({
    formId,
    queryConfig: {
      enabled: !!formId,
      onSuccess: (data: any) => {
        console.log("Query success:", data);
      },
      onError: (error: AxiosError) => {
        toast.error("Failed to load form layout");
        console.error("Error loading form layout:", error);
      },
    },
  });

  const form = data?.data || data;

  if (isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading form</div>;
  }

  if (!form || !form.sections) {
    return <div>Form data not available</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ErrorBoundary
        FallbackComponent={FormErrorFallback}
        onError={(error, errorInfo) => {
          console.error("Form error boundary caught an error:", error, errorInfo);
        }}
        resetKeys={[form.sections, formId]} // Use form from the hook, not loader
      >
        <DynamicForm
          isPreview={false}
          formHashId={formId}
          sections={form.sections}
          title={form.title}
          description={form.description ?? ""}
          onSubmit={(data) => {
            console.log("Form submitted:", data);
          }}
        />
      </ErrorBoundary>
    </div>
  );
};