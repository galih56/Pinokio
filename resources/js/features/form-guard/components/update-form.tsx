"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Settings,
  Shield,
  Globe,
  Key,
  UserCheck,
  Save,
  X,
  Eye,
  Timer,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useUpdateForm, type UpdateFormInput, updateFormSchema } from "../api/update-form"
import { useFormDetail } from "../api/get-form"
import { z } from "zod"
import { ExpiryDateTimeField } from "./expiry-date-time-field"

interface FormEditProps {
  formId: string
  onCancel?: () => void
  onSuccess?: () => void
}

export function FormEdit({ formId, onCancel, onSuccess }: FormEditProps) {
  const formQuery = useFormDetail({ formId })
  const updateFormMutation = useUpdateForm({
    formId,
    mutationConfig: {
      onSuccess: () => {
        toast.success("Form updated successfully")
        onSuccess?.()
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update form")
      },
    },
  })

  const [formData, setFormData] = useState<UpdateFormInput>({
    title: "",
    description: "",
    provider: "Pinokio",
    formCode: "",
    formUrl: "",
    accessType: "public",
    identifierLabel: "",
    identifierDescription: "",
    identifierType: "email",
    expiresAt: null,
    timeLimit: undefined,
    allowMultipleAttempts: false,
    isActive: true,
    proctored: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when query loads
  useEffect(() => {
    if (formQuery.data?.data) {
      const form = formQuery.data.data
      setFormData({
        title: form.title || "",
        description: form.description || "",
        provider: form.provider || "Pinokio",
        formCode: form.formCode || "",
        formUrl: form.formUrl || "",
        accessType: form.accessType || "public",
        identifierLabel: form.identifierLabel || "",
        identifierDescription: form.identifierDescription || "",
        identifierType: form.identifierType || "email",
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        timeLimit: form.timeLimit || undefined,
        allowMultipleAttempts: form.allowMultipleAttempts || false,
        isActive: form.isActive ?? true,
        proctored: form.proctored || false,
      })
    }
  }, [formQuery.data])

  const validateForm = () => {
    try {
      updateFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join(".")
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving")
      return
    }

    updateFormMutation.mutate({
      data: formData,
      formId,
    })
  }

  const updateFormData = (field: keyof UpdateFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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

  if (formQuery.isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (formQuery.isError) {
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
              <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.accessType === "public"
                    ? "Public Access"
                    : formData.accessType === "token"
                      ? "Authorized Link"
                      : "ID Required"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={updateFormMutation.isPending}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateFormMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateFormMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Configure form title, description and provider settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Form Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter form title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Form Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Enter form description"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">You can use HTML tags for formatting</p>
            </div>

            <Separator />

            {/* Provider Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium">Provider Configuration</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Select value={formData.provider} onValueChange={(value) => updateFormData("provider", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pinokio">📝 Pinokio</SelectItem>
                      <SelectItem value="Google Form">🔗 Google Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.provider === "Google Form" && (
                  <div className="space-y-2">
                    <Label htmlFor="formCode">Form Code *</Label>
                    <Input
                      id="formCode"
                      value={formData.formCode}
                      onChange={(e) => updateFormData("formCode", e.target.value)}
                      placeholder="Enter Google Form code"
                      className={errors.formCode ? "border-red-500" : ""}
                    />
                    {errors.formCode && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.formCode}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {formData.provider === "Google Form" && (
                <div className="space-y-2">
                  <Label htmlFor="formUrl">Form URL *</Label>
                  <Input
                    id="formUrl"
                    value={formData.formUrl}
                    onChange={(e) => updateFormData("formUrl", e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    className={errors.formUrl ? "border-red-500" : ""}
                  />
                  {errors.formUrl && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.formUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Status & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status & Access
            </CardTitle>
            <CardDescription>Configure form availability and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Form Status</Label>
                <p className="text-sm text-muted-foreground">Control if the form is active</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={(checked) => updateFormData("isActive", checked)} />
            </div>

            <Separator />

            {/* Access Type */}
            <div className="space-y-3">
              <Label>Access Type</Label>
              <div className="space-y-2">
                {[
                  { value: "public", label: "Open to Everyone", icon: Globe, desc: "Anyone can access this form" },
                  { value: "token", label: "Authorized Link", icon: Key, desc: "Share link with authorized token" },
                  { value: "identifier", label: "Requires Personal ID", icon: UserCheck, desc: "User must provide ID" },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <div
                    key={value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.accessType === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => updateFormData("accessType", value)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          formData.accessType === value ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identifier Configuration */}
            {formData.accessType === "identifier" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Identifier Configuration</h4>

                  <div className="space-y-2">
                    <Label htmlFor="identifierLabel">Identifier Label *</Label>
                    <Input
                      id="identifierLabel"
                      value={formData.identifierLabel}
                      onChange={(e) => updateFormData("identifierLabel", e.target.value)}
                      placeholder="e.g., Student ID, Employee Number"
                      className={errors.identifierLabel ? "border-red-500" : ""}
                    />
                    {errors.identifierLabel && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.identifierLabel}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identifierDescription">Description</Label>
                    <Textarea
                      id="identifierDescription"
                      value={formData.identifierDescription}
                      onChange={(e) => updateFormData("identifierDescription", e.target.value)}
                      placeholder="Additional instructions for the identifier"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identifierType">Identifier Type *</Label>
                    <Select
                      value={formData.identifierType}
                      onValueChange={(value) => updateFormData("identifierType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Security and behavior configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proctoring */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Proctoring
                  </Label>
                  <p className="text-xs text-muted-foreground">Monitor form completion</p>
                </div>
                <Switch
                  checked={formData.proctored}
                  onCheckedChange={(checked) => updateFormData("proctored", checked)}
                />
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-2">
              <Label htmlFor="timeLimit" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Time Limit (minutes)
              </Label>
              <Input
                id="timeLimit"
                type="number"
                value={formData.timeLimit || ""}
                onChange={(e) =>
                  updateFormData("timeLimit", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
                placeholder="No limit"
                min="0"
                className={errors.timeLimit ? "border-red-500" : ""}
              />
              {errors.timeLimit && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.timeLimit}
                </p>
              )}
            </div>

            {/* Multiple Attempts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Multiple Attempts
                  </Label>
                  <p className="text-xs text-muted-foreground">Allow retaking the form</p>
                </div>
                <Switch
                  checked={formData.allowMultipleAttempts}
                  onCheckedChange={(checked) => updateFormData("allowMultipleAttempts", checked)}
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2 col-span-2">
              <ExpiryDateTimeField
                value={formData.expiresAt}
                onChange={(date) => updateFormData("expiresAt", date)}
                label="Expiry Date & Time"
                description="Set when this form should expire"
                defaultExpiryDays={7}
                allowNoExpiry={true}
                minDate={new Date()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>How your form configuration will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{formData.title || "Untitled Form"}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {getAccessTypeIcon(formData.accessType)}
                    {formData.accessType === "public"
                      ? "Public Access"
                      : formData.accessType === "token"
                        ? "Authorized Link"
                        : "ID Required"}
                  </Badge>
                </div>
              </div>
            </div>

            {formData.description && <div className="text-sm text-muted-foreground">{formData.description}</div>}

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Provider: {formData.provider}</span>
              {formData.timeLimit && <span>Time Limit: {formData.timeLimit} min</span>}
              {formData.proctored && <span>Proctored</span>}
              {formData.allowMultipleAttempts && <span>Multiple Attempts</span>}
              {formData.expiresAt && <span>Expires: {formData.expiresAt.toLocaleDateString()}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
