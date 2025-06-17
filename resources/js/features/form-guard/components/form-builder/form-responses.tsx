"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import type { FormResponse, FormSection, FormSubmission, FormEntry, FormField } from "@/types/form"
import { useState, useMemo, useEffect } from "react"
import { useGetFormResponses } from "../../api/use-get-form-responses"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { MoveLeft } from "lucide-react"
import { formatDateTime } from "@/lib/datetime"
import { createFieldColumns } from "@/lib/utils"

interface FormResponsesProps {
  formId: string
  formSections: FormSection[]
  initialData: FormResponse[]
}

// Extended types to match what your API returns (camelized)
interface ExtendedFormSubmission extends FormSubmission {
  form: {
    id: string
    title: string
    description: string | null
  }
  submittedByUser: {
    id: string
    name: string
    email: string
  }
  entries: Array<
    FormEntry & {
      formField: FormField & {
        fieldType: {
          id: string
          name: string
        }
        options: Array<{
          id: string
          formFieldId: string
          label: string
          value: string
        }>
      }
    }
  >
  totalEntries: number
  hasAttempts: boolean
}

export function FormResponses({ formId, formSections, initialData }: FormResponsesProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = +(searchParams.get("page") || 1)
  const search = searchParams.get("search") || ""

  const [searchTerm, setSearchTerm] = useState(search)

  const formResponsesQuery = useGetFormResponses({
    formId,
    page: currentPage,
    perPage: 15,
    search,
  })

  useEffect(() => {
    // Sync the search term with query parameters
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (searchTerm) {
          params.set("search", searchTerm)
        } else {
          params.delete("search")
        }
        // Reset to page 1 when searching
        if (searchTerm !== search) {
          params.delete("page")
        }
        return params
      })
    }, 300) // Add debounce to avoid excessive API calls

    return () => clearTimeout(timeout)
  }, [searchTerm, setSearchParams, search])

  const goBack = () => navigate(-1);

  // Get the API responses using your existing types
  const entries = (formResponsesQuery.data?.data as ExtendedFormSubmission[]) || []
  const meta = formResponsesQuery.data?.meta

  // Convert to your FormResponse format
  const responses: FormResponse[] = useMemo(() => {
    return entries.map((response) => ({
      id: response.id,
      submittedAt: response.submittedAt.toString(),
      data: response.entries.reduce(
        (acc, entry) => {
          const fieldId = entry.formField?.id
          const options = entry.formField?.options

          if (fieldId) {
            if (options && options.length > 0) {
              // For select/radio/checkbox fields with options
              const selectedOptions = options.filter(option => 
                entry.value === option.value || 
                (Array.isArray(entry.value) && entry.value.includes(option.value))
              );
              acc[fieldId] = selectedOptions.length > 0 ? 
                selectedOptions.map(option => option.label) : 
                entry.value;
            } else {
              acc[fieldId] = entry.value
            }
          }
          return acc
        },
        {} as Record<string, any>,
      ),
    }))
  }, [entries])

  // Get all unique fields from API responses
  const getAllFieldsFromResponses = useMemo(() => {
    const fieldsMap = new Map()

    entries.forEach((response) => {
      response.entries.forEach((entry) => {
        const field = entry.formField
        if (field && !fieldsMap.has(field.id)) {
          fieldsMap.set(field.id, {
            id: field.id,
            label: field.label,
            type: field.fieldType.name.toLowerCase(), // Normalize field type
            formSectionId: "",
            fieldTypeId: field.fieldTypeId,
            isRequired: field.isRequired || false,
            order: field.order || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      })
    })

    // Sort fields by order if available
    return Array.from(fieldsMap.values()).sort((a, b) => a.order - b.order)
  }, [entries])

  const fieldsToDisplay = getAllFieldsFromResponses

  // Create columns for DataTable with enhanced options
  const columns: ColumnDef<FormResponse>[] = useMemo(() => {
    const baseColumns: ColumnDef<FormResponse>[] = [
      {
        accessorKey: "submittedAt",
        header: "Submitted At",
        cell: ({ row }) => {
          const response = row.original
          return formatDateTime(new Date(response.submittedAt))
        },
      }
    ]

    const fieldColumns = createFieldColumns(fieldsToDisplay, {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MMM d, yyyy',
      datetimeFormat: 'MMM d, yyyy HH:mm',
      currencyCode: 'USD', 
      maxStringLength: 80,
      emptyValueDisplay: 'N/A',
      showValidationErrors: false,
    });

    return [...baseColumns, ...fieldColumns]
  }, [fieldsToDisplay])

  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(["forms", formId, "responses", { page: newPage }], formResponsesQuery.data)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set("page", newPage.toString())
      return params
    })
    formResponsesQuery.refetch()
  }

  const EmptyFieldFallback = () => {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No form fields available. Create some fields first to see responses.</p>
        <div className="flex space-x-2 mt-4 justify-center">
          <Button variant="outline" onClick={goBack}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!formSections) {
    return <EmptyFieldFallback />
  }

  const allFields = formSections.flatMap((section) => section.fields)

  if (allFields.length === 0) {
    return <EmptyFieldFallback />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Form Responses
            <Badge variant="secondary">{meta?.totalCount || responses?.length || 0} responses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {formResponsesQuery.isPending ? (
            <Skeleton className="w-full min-h-[60vh]" />
          ) : !responses || responses.length === 0 ? (
            <div className="flex items-center justify-center w-full min-h-[60vh]">
              <p className="text-gray-500">No responses found.</p>
            </div>
          ) : (
            <DataTable
              data={responses}
              columns={columns}
              pagination={
                meta && {
                  totalPages: meta.totalPages,
                  perPage: meta.perPage,
                  totalCount: meta.totalCount,
                  currentPage: meta.currentPage,
                  rootUrl: "",
                }
              }
              onPaginationChange={onPageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
