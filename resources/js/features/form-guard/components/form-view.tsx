"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Settings,
  Shield,
  Users,
  Link2,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Globe,
  Key,
  UserCheck,
  Timer,
  RefreshCw,
  ExternalLink,
  Copy,
  Edit,
  Send,
  Clock,
  AlertTriangle,
  LinkIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import DOMPurify from "dompurify"
import { formatDate, formatDateTime } from "@/lib/datetime"
import { DescriptionSectionEdit } from "./form-sections/description-section-edit"
import { ConfigSectionEdit } from "./form-sections/config-section-edit"
import { AdvancedSectionEdit } from "./form-sections/advanced-section-edit"
import { ExpirySectionEdit } from "./form-sections/expiry-section-edit"
import { useFormDetail } from "../api/get-form"
import { useUpdateForm } from "../api/update-form"
import { useGenerateLinkDialog } from "./generate-link/use-generate-link-dialog"
import { GenerateLinkDialog } from "./generate-link/generate-link-dialog"
import { useBreadcrumbSync } from "@/components/layout/breadcrumbs/breadcrumbs-store"
import { Link } from "react-router-dom"
import { Form } from "@/types/form"

type EditingSection = "description" | "config" | "advanced" | "expiry" | "form-builder" | null

interface FormViewProps {
  formId: string
  initialData: Form
  onGenerateLink?: () => void
}

export function FormView({ formId, initialData, onGenerateLink }: FormViewProps) {
  const [editingSection, setEditingSection] = useState<EditingSection>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const { isOpen, selectedForm, generatedLink, isGenerating, handleGenerateLink , handleGenerateLinkWithExpiry, handleDialogClose } =
    useGenerateLinkDialog();

  // Use initialData with background refresh for optimistic updates
  const formQuery = useFormDetail({ 
    formId,
    initialData: {
      data: initialData,
      status: 'success'
    }
  })
  
  const updateFormMutation = useUpdateForm({
    formId,
    mutationConfig: {
      onSuccess: () => {
        setEditingSection(null)
      },
      onError: (error: any) => {},
    },
  })

  // Use initialData as fallback, then fresh data when available
  const form = formQuery.data?.data || initialData
  
  // Set breadcrumbs with initial data immediately
  useBreadcrumbSync(`/forms/:id`, `/forms/${formId}`, form?.title, [form])

  const handleSaveDescription = (data: { title: string; description?: string }) => {
    if (!form) return

    updateFormMutation.mutate({
      data: {
        ...form,
        title: data.title,
        description: data.description,
      },
      formId,
    })
  }

  const handleSaveConfig = (data: {
    provider: "Pinokio" | "Google Form"
    formCode?: string
    formUrl?: string
    isActive: boolean
  }) => {
    if (!form) return

    updateFormMutation.mutate({
      data: {
        ...form,
        provider: data.provider,
        formCode: data.formCode,
        formUrl: data.formUrl,
        isActive: data.isActive,
      },
      formId,
    })
  }

  const handleSaveAdvanced = (data: {
    proctored: boolean
    timeLimit?: number
    allowMultipleAttempts: boolean
  }) => {
    if (!form) return

    updateFormMutation.mutate({
      data: {
        ...form,
        proctored: data.proctored,
        timeLimit: data.timeLimit,
        allowMultipleAttempts: data.allowMultipleAttempts,
      },
      formId,
    })
  }

  const handleSaveExpiry = (data: { expiresAt: Date | null }) => {
    if (!form) return

    updateFormMutation.mutate({
      data: {
        ...form,
        expiresAt: data.expiresAt,
      },
      formId,
    })
  }

  const copyFormUrl = async () => {
    if (form?.formUrl) {
      await navigator.clipboard.writeText(form.formUrl)
      setCopiedUrl(true)
      toast.info("URL Copied", {
        description: "Form URL has been copied to clipboard",
      })
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  // Show loading only if we don't have initialData and query is pending
  if (!initialData && formQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error only if we don't have initialData and query failed
  if (!initialData && (formQuery.isError || !form)) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <p className="text-red-500">Failed to load form data</p>
      </div>
    )
  }

  // If we have initialData but no form (shouldn't happen), use initialData
  const displayForm = form || initialData

  if (!displayForm) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <p className="text-red-500">No form data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{displayForm.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={displayForm.isActive ? "default" : "secondary"} className="gap-1">
                  {displayForm.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {displayForm.isActive ? "Active" : "Inactive"}
                </Badge>
                {/* Show refresh indicator if data is being updated */}
                {formQuery.isFetching && (
                  <Badge variant="outline" className="gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Syncing
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="./layout">
            <Button variant="outline" size="sm" >
              <Edit className="h-4 w-4 mr-2" />
              Edit Form
            </Button>
          </Link>
          <Button size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size={"sm"}  onClick={() => handleGenerateLink(displayForm)}  >
            <LinkIcon className="h-4 w-4 mr-2" />
            Get the link
          </Button>
        </div>
      </div>

      {/* Description Card */}
      {editingSection === "description" ? (
        <DescriptionSectionEdit
          initialData={{
            title: displayForm.title,
            description: displayForm.description,
          }}
          onSave={handleSaveDescription}
          onCancel={() => setEditingSection(null)}
          isPending={updateFormMutation.isPending}
        />
      ) : (
        displayForm.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayForm.description) }}
              />
            </CardContent>
          </Card>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration */}
        {editingSection === "config" ? (
          <ConfigSectionEdit
            initialData={{
              provider: displayForm.provider,
              formCode: displayForm.formCode,
              formUrl: displayForm.formUrl,
              isActive: displayForm.isActive,
            }}
            onSave={handleSaveConfig}
            onCancel={() => setEditingSection(null)}
            isPending={updateFormMutation.isPending}
          />
        ) : (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Form Configuration
                  </CardTitle>
                  <CardDescription>Basic settings and provider information</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingSection("config")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Section */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-lg">{displayForm.provider === "Google Form" ? "🔗" : "📝"}</span>
                  Provider Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Provider</p>
                    <p className="text-sm">{displayForm.provider}</p>
                  </div>
                  {displayForm.formUrl && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Form URL</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm truncate flex-1">{displayForm.formUrl}</p>
                        <Button variant="ghost" size="sm" onClick={copyFormUrl} className="h-6 w-6 p-0">
                          {copiedUrl ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(displayForm.formUrl, "_blank")}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Access Configuration */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Access Configuration
                </h4>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Settings */}
        {editingSection === "advanced" ? (
          <AdvancedSectionEdit
            initialData={{
              proctored: displayForm.proctored,
              timeLimit: displayForm.timeLimit,
              allowMultipleAttempts: displayForm.allowMultipleAttempts,
            }}
            onSave={handleSaveAdvanced}
            onCancel={() => setEditingSection(null)}
            isPending={updateFormMutation.isPending}
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Security and behavior options</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditingSection("advanced")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Proctoring */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Proctoring</span>
                </div>
                <Badge variant={displayForm.proctored ? "default" : "secondary"}>
                  {displayForm.proctored ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {/* Time Limit */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">Time Limit</span>
                </div>
                <Badge variant="outline">{displayForm.timeLimit ? `${displayForm.timeLimit} min` : "No limit"}</Badge>
              </div>

              {/* Multiple Attempts */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Multiple Attempts</span>
                </div>
                <Badge variant={displayForm.allowMultipleAttempts ? "default" : "secondary"}>
                  {displayForm.allowMultipleAttempts ? "Allowed" : "Not allowed"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Expiry Settings */}
      {editingSection === "expiry" ? (
        <ExpirySectionEdit
          initialData={{
            expiresAt: displayForm.expiresAt ? new Date(displayForm.expiresAt) : null,
          }}
          onSave={handleSaveExpiry}
          onCancel={() => setEditingSection(null)}
          isPending={updateFormMutation.isPending}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Expiry Settings
                </CardTitle>
                <CardDescription>When this form will expire</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingSection("expiry")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expiry Date</span>
                <Badge variant={displayForm.expiresAt ? "outline" : "secondary"}>
                  {displayForm.expiresAt ? formatDateTime(displayForm.expiresAt) : "No expiry"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
  

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Form Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{formatDateTime(displayForm.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDateTime(displayForm.updatedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
              <p className="text-sm">{displayForm.expiresAt ? formatDate(displayForm.expiresAt) : "No due date"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      {displayForm.provider == "Pinokio" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Responses
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Access
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Form Settings
              </Button>
              {displayForm.formUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(displayForm.formUrl, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <GenerateLinkDialog
        isOpen={isOpen}
        onOpenChange={handleDialogClose}
        item={selectedForm}
        onGenerateLink={handleGenerateLinkWithExpiry}
        generatedLink={generatedLink}
        isGenerating={isGenerating}
        title="Generate Form Link"
        description="Generate a shareable link for this form with custom expiry settings"
        itemTypeLabel="Form"
        defaultExpiryDays={1}
      />
    </div>
  )
}