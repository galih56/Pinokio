"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Check, X, AlertCircle, Settings, Globe, Key, UserCheck } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { extractGoogleFormCode } from "@/lib/common"

interface ConfigSectionEditProps {
  initialData: {
    provider: "Pinokio" | "Google Form"
    formCode?: string
    formUrl?: string
    accessType: "public" | "token" | "identifier"
    isActive: boolean
  }
  onSave: (data: {
    provider: "Pinokio" | "Google Form"
    formCode?: string
    formUrl?: string
    accessType: "public" | "token" | "identifier"
    isActive: boolean
  }) => void
  onCancel: () => void
  isPending: boolean
}

const configSchema = z.object({
  provider: z.enum(["Pinokio", "Google Form"]),
  formCode: z.string().optional(),
  formUrl: z.string().url({ message: "Invalid URL." }).optional(),
  accessType: z.enum(["public", "token", "identifier"]),
  isActive: z.boolean(),
})

export function ConfigSectionEdit({ initialData, onSave, onCancel, isPending }: ConfigSectionEditProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      provider: initialData.provider,
      formCode: initialData.formCode || "",
      formUrl: initialData.formUrl || "",
      accessType: initialData.accessType,
      isActive: initialData.isActive,
    },
  })

  const provider = watch("provider")
  const formUrl = watch("formUrl")

  // Extract Google Form code when URL changes
  useEffect(() => {
    if (provider === "Google Form" && formUrl) {
      const code = extractGoogleFormCode(formUrl)
      if (code) {
        setValue("formCode", code)
      }
    }
  }, [formUrl, provider, setValue])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Edit Form Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSave)}>
          <div className="space-y-6">
            {/* Provider Section */}
            <div className="space-y-3">
              <h4 className="font-medium">Provider Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Controller
                    name="provider"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pinokio">📝 Pinokio</SelectItem>
                          <SelectItem value="Google Form">🔗 Google Form</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {provider === "Google Form" && (
                  <Controller
                    name="formCode"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}
              </div>

              {provider === "Google Form" && (
                <div className="space-y-2">
                  <Label htmlFor="formUrl">Form URL *</Label>
                  <Controller
                    name="formUrl"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="formUrl"
                        placeholder="https://docs.google.com/forms/..."
                        className={errors.formUrl ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.formUrl && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.formUrl.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Access Configuration */}
            <div className="space-y-3">
              <h4 className="font-medium">Access Configuration</h4>

              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>Form Status</Label>
                  <p className="text-sm text-muted-foreground">Control if the form is active</p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>

              <Label>Access Type</Label>
              <Controller
                name="accessType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {[
                      {
                        value: "public",
                        label: "Open to Everyone",
                        icon: Globe,
                        desc: "Anyone can access this form",
                      },
                      { value: "token", label: "Authorized Link", icon: Key, desc: "Share link with authorized token" },
                      {
                        value: "identifier",
                        label: "Requires Personal ID",
                        icon: UserCheck,
                        desc: "User must provide ID",
                      },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <div
                        key={value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          field.value === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => field.onChange(value)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              field.value === value ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                <Check className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
