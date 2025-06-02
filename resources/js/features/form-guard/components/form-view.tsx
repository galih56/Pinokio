"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { formatDate, formatDateTime } from "@/lib/datetime"
import DOMPurify from "dompurify"
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
  Link,
  Send,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useFormDetail } from "../api/get-form"
import { adjustActiveBreadcrumbs } from "@/components/layout/breadcrumbs/breadcrumbs-store"
import { Spinner } from "@/components/ui/spinner"

interface TokenStats {
  generated: number
  used: number
  unused: number
  expired: number
}

interface FormViewProps {
  formId: string
  onGenerateLink?: () => void
}

export function FormView({ formId, onGenerateLink }: FormViewProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    generated: 45,
    used: 32,
    unused: 8,
    expired: 5,
  })

  const formQuery = useFormDetail({
    formId,
  })

  
  const form = formQuery?.data?.data
  adjustActiveBreadcrumbs(`/forms/:id`, `/forms/${formId}`, form?.title, [form])

  if (!formId) {
    return <h1>Unrecognized Request</h1>
  }

  if (formQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!form) return null
  
  const copyFormUrl = async () => {
    if (form.formUrl) {
      await navigator.clipboard.writeText(form.formUrl)
      setCopiedUrl(true)
      toast.info("URL Copied", {
        description: "Form URL has been copied to clipboard",
      })
      setTimeout(() => setCopiedUrl(false), 2000)
    }
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "Google Form":
        return "🔗"
      case "Pinokio":
        return "📝"
      default:
        return "📄"
    }
  }

  const completionRate = tokenStats.generated > 0 ? (tokenStats.used / tokenStats.generated) * 100 : 0

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
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Form
          </Button>
          <Button size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={onGenerateLink}>
            <Link className="h-4 w-4 mr-2" />
            Generate Link
          </Button>
        </div>
      </div>

      {/* Description Card */}
      {form.description && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Form Configuration
            </CardTitle>
            <CardDescription>Basic settings and provider information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Section */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="text-lg">{getProviderIcon(form.provider)}</span>
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

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>Security and behavior options</CardDescription>
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
      </div>

      {/* Assessment Progress Card - NEW */}
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
                <Button className="w-full justify-start" onClick={onGenerateLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate New Link
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
              <p className="text-sm">{form.dueDate ? formatDate(form.dueDate) : "No due date"}</p>
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
    </div>
  )
}
