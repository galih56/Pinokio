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
  Link,
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
import { adjustActiveBreadcrumbs } from "@/components/layout/breadcrumbs/breadcrumbs-store"

type EditingSection = "description" | "config" | "advanced" | "expiry" | null

interface FormViewProps {
  formId: string
  onGenerateLink?: () => void
}

export function FormView({ formId, onGenerateLink }: FormViewProps) {
  const [editingSection, setEditingSection] = useState<EditingSection>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const { isOpen, selectedForm, generatedLink, isGenerating, handleGenerateLink , handleGenerateLinkWithExpiry, handleDialogClose } =
    useGenerateLinkDialog();

  const formQuery = useFormDetail({ formId })
  const updateFormMutation = useUpdateForm({
    formId,
    mutationConfig: {
      onSuccess: () => {
        setEditingSection(null)
      },
      onError: (error: any) => {},
    },
  })

  // Mock token stats - replace with real data
  const [tokenStats] = useState({
    generated: 45,
    used: 32,
    unused: 8,
    expired: 5,
  })

  const form = formQuery.data?.data
  adjustActiveBreadcrumbs(`/forms/:id`, `/forms/${formId}`, form?.title, [form])

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
    accessType: "public" | "token" | "identifier"
    isActive: boolean
  }) => {
    if (!form) return

    updateFormMutation.mutate({
      data: {
        ...form,
        provider: data.provider,
        formCode: data.formCode,
        formUrl: data.formUrl,
        accessType: data.accessType,
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

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "token":
        return <Key className="h-4 w-4" />
      case "identifier":
        return <UserCheck className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getAccessTypeTitle = (accessType: string) => {
    switch (accessType) {
      case "public":
        return "Open to Everyone"
      case "token":
        return "Authorized Link"
      case "identifier":
        return "Requires Personal ID"
      default:
        return "-"
    }
  }

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case "public":
        return "bg-green-100 text-green-800 border-green-200"
      case "token":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "identifier":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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

  const completionRate = tokenStats.generated > 0 ? (tokenStats.used / tokenStats.generated) * 100 : 0

  if (formQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (formQuery.isError || !form) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <p className="text-red-500">Failed to load form data</p>
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
              <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={form.isActive ? "default" : "secondary"} className="gap-1">
                  {form.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {form.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className={`gap-1 ${getAccessTypeColor(form.accessType)}`}>
                  {getAccessTypeIcon(form.accessType)}
                  {form.accessType === "public"
                    ? "Public Access"
                    : form.accessType === "token"
                      ? "Authorized Link"
                      : "ID Required"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size={"sm"}  onClick={() => handleGenerateLink(form)}  >
            <Link className="h-4 w-4 mr-2" />
            Get the link
          </Button>
        </div>
      </div>

      {/* Description Card */}
      {editingSection === "description" ? (
        <DescriptionSectionEdit
          initialData={{
            title: form.title,
            description: form.description,
          }}
          onSave={handleSaveDescription}
          onCancel={() => setEditingSection(null)}
          isPending={updateFormMutation.isPending}
        />
      ) : (
        form.description && (
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
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
              provider: form.provider,
              formCode: form.formCode,
              formUrl: form.formUrl,
              accessType: form.accessType,
              isActive: form.isActive,
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
                  <span className="text-lg">{form.provider === "Google Form" ? "🔗" : "📝"}</span>
                  Provider Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Provider</p>
                    <p className="text-sm">{form.provider}</p>
                  </div>
                  {form.formUrl && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Form URL</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm truncate flex-1">{form.formUrl}</p>
                        <Button variant="ghost" size="sm" onClick={copyFormUrl} className="h-6 w-6 p-0">
                          {copiedUrl ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(form.formUrl, "_blank")}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Access Type</p>
                    <div className="flex items-center gap-2">
                      {getAccessTypeIcon(form.accessType)}
                      <p className="text-sm capitalize">{getAccessTypeTitle(form.accessType)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Settings */}
        {editingSection === "advanced" ? (
          <AdvancedSectionEdit
            initialData={{
              proctored: form.proctored,
              timeLimit: form.timeLimit,
              allowMultipleAttempts: form.allowMultipleAttempts,
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
                <Badge variant={form.proctored ? "default" : "secondary"}>
                  {form.proctored ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {/* Time Limit */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">Time Limit</span>
                </div>
                <Badge variant="outline">{form.timeLimit ? `${form.timeLimit} min` : "No limit"}</Badge>
              </div>

              {/* Multiple Attempts */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm font-medium">Multiple Attempts</span>
                </div>
                <Badge variant={form.allowMultipleAttempts ? "default" : "secondary"}>
                  {form.allowMultipleAttempts ? "Allowed" : "Not allowed"}
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
            expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
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
                <Badge variant={form.expiresAt ? "outline" : "secondary"}>
                  {form.expiresAt ? formatDateTime(form.expiresAt) : "No expiry"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assessment Progress
          </CardTitle>
          <CardDescription>Track assessment completion and token usage</CardDescription>
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
                <Button size={"sm"}  onClick={() => handleGenerateLink(form)}  >
                  <Link2 className="h-4 w-4 mr-2" />
                  Get the link
                </Button>
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
              <p className="text-sm">{formatDateTime(form.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDateTime(form.updatedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Due Date</p>
              <p className="text-sm">{form.expiresAt ? formatDate(form.expiresAt) : "No due date"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {form.provider == "Pinokio" && (
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
              {form.formUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(form.formUrl, "_blank")}>
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
