"use client"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { FormSection } from "@/types/form"

interface FormResponsesProps {
  formSections: FormSection[]
}

// Mock responses data
const mockResponses = [
  {
    id: "1",
    submittedAt: "2024-01-15T10:30:00Z",
    data: {
      "field-1": "John Doe",
      "field-2": "john@example.com",
      "field-3": "25",
      "field-4": "Option 1",
    },
  },
  {
    id: "2",
    submittedAt: "2024-01-15T14:20:00Z",
    data: {
      "field-1": "Jane Smith",
      "field-2": "jane@example.com",
      "field-3": "30",
      "field-4": "Option 2",
    },
  },
]

export function FormResponses({ formSections }: FormResponsesProps) {
  const allFields = formSections.flatMap((section) => section.fields)

  const { data: responses, isLoading } = useQuery({
    queryKey: ["form-responses"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return mockResponses
    },
  })

  if (allFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No form fields available. Create some fields first to see responses.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading responses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Form Responses
            <Badge variant="secondary">{responses?.length || 0} responses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!responses || responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No responses yet. Share your form to start collecting responses.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    {allFields.map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>{new Date(response.submittedAt).toLocaleDateString()}</TableCell>
                      {allFields.map((field) => (
                        <TableCell key={field.id}>
                          {Array.isArray(response.data[field.id])
                            ? response.data[field.id].join(", ")
                            : response.data[field.id] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
