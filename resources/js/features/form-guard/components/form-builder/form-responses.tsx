"use client"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { FormResponse, FormSection, FormSubmission, FormEntry, FormField } from "@/types/form"
import { AlertTriangle, CheckCircle, Clock, Eye, Link2, MoveLeft, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useState, useMemo } from "react"
import { useGetFormResponses } from "../../api/use-get-form-responses"
import { useNavigate } from "react-router-dom"

interface FormResponsesProps {
  formId : string;
  formSections: FormSection[];
  initialData : FormResponse[];
}

// Extended types to match what your API returns (camelized)
interface ExtendedFormSubmission extends FormSubmission {
  form: {
    id: string;
    title: string;
    description: string | null;
  };
  submittedByUser: {
    id: string;
    name: string;
    email: string;
  };
  entries: Array<FormEntry & {
    formField: FormField & {
      fieldType: {
        id: string;
        name: string;
      };
      options: Array<{
        id: string;
        formFieldId: string;
        label: string;
        value: string;
      }>;
    };
  }>;
  totalEntries: number;
  hasAttempts: boolean;
}

export function FormResponses({ formId, formSections, initialData }: FormResponsesProps) {
  const [tokenStats] = useState({
    generated: 45,
    used: 32,
    unused: 8,
    expired: 5,
  })

  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const formResponsesQuery = useGetFormResponses({
    formId
  });
  
  // Get the API responses using your existing types
  const entries = formResponsesQuery.data?.data as ExtendedFormSubmission[] || [];
// Convert to your FormResponse format
const responses: FormResponse[] = useMemo(() => {
  return entries.map(response => ({
    id: response.id,
    submittedAt: response.submittedAt.toString(),
    data: response.entries.reduce((acc, entry) => {
      const fieldId = entry.formField?.id;
      if (fieldId) {
        acc[fieldId] = entry.value;
      }
      return acc;
    }, {} as Record<string, any>)
  }));
}, [entries]);

// Get all unique fields from API responses
const getAllFieldsFromResponses = useMemo(() => {
  const fieldsMap = new Map();
  
  entries.forEach(response => {
    response.entries.forEach(entry => {
      const field = entry.formField;
      if (field && !fieldsMap.has(field.id)) {
        fieldsMap.set(field.id, {
          id: field.id,
          label: field.label,
          name: field.name,
          type: field.fieldType.name,
          // Add other properties you might need
          formSectionId: '', // You might not have this
          fieldTypeId: field.fieldTypeId.toString(),
          isRequired: false, // Default values
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
  });
  
  return Array.from(fieldsMap.values());
}, [entries]);


  const EmptyFieldFallback = () => {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>
          No form fields available. Create some fields first to see responses.
        </p>
        <div className="flex space-x-2 mt-4 justify-center" >
          <Button 
            variant="outline"
            onClick={goBack}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!formSections) {
    return (
      <EmptyFieldFallback />
    )
  }

  const completionRate = tokenStats.generated > 0 ? (tokenStats.used / tokenStats.generated) * 100 : 0
  const allFields = formSections.flatMap((section) => section.fields)

  if (allFields.length === 0) {
    return (
      <EmptyFieldFallback />
    )
  }

  const fieldsToDisplay = getAllFieldsFromResponses;
  if (formResponsesQuery.isPending) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading responses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Record Progress Card - keeping your existing code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Record Progress
          </CardTitle>
          <CardDescription>Track record completion and token usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Completion Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        completionRate >= 80
                          ? "text-green-600"
                          : completionRate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {completionRate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {completionRate >= 80
                        ? "Great progress!"
                        : completionRate >= 50
                          ? "Good progress"
                          : "Needs attention"}
                    </span>
                  </div>
                </div>
                <Progress value={completionRate} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tokenStats.used} completed</span>
                  <span>{tokenStats.generated} total invites</span>
                </div>
              </div>

              {/* Token Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Link2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-700">{tokenStats.generated}</p>
                  <p className="text-xs text-blue-600">Generated</p>
                </div>

                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-700">{tokenStats.used}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>

                <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-700">{tokenStats.unused}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>

                <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-700">{tokenStats.expired}</p>
                  <p className="text-xs text-orange-600">Expired</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Quick Actions</h4>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Responses
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Expiry
                </Button>
              </div>

              {tokenStats.expired > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      {tokenStats.expired} expired links. Consider regenerating links for pending applicants.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Responses Table */}
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
                    <TableHead>Submitted By</TableHead>
                    {fieldsToDisplay.map((field) => (
                      <TableHead key={field.id}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response, index) => {
                    const apiResponse = entries[index];
                    
                    return (
                      <TableRow key={response.id}>
                        <TableCell>
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {apiResponse?.submittedByUser?.name || 'Unknown'}
                        </TableCell>
                        {fieldsToDisplay.map((field) => (
                          <TableCell key={field.id}>
                            {Array.isArray(response?.data[field.id])
                              ? response.data[field.id].join(", ")
                              : response.data[field.id] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
