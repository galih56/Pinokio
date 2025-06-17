"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Check, X, AlertCircle, Shield, Eye, Timer, RefreshCw } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface AdvancedSectionEditProps {
  initialData: {
    proctored: boolean
    timeLimit?: number
    allowMultipleAttempts: boolean
  }
  onSave: (data: {
    proctored: boolean
    timeLimit?: number
    allowMultipleAttempts: boolean
  }) => void
  onCancel: () => void
  isPending: boolean
}

const advancedSchema = z.object({
  proctored: z.boolean(),
  timeLimit: z.coerce.number().min(0, { message: "Time limit cannot be negative." }).optional(),
  allowMultipleAttempts: z.boolean(),
})

export function AdvancedSectionEdit({ initialData, onSave, onCancel, isPending }: AdvancedSectionEditProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(advancedSchema),
    defaultValues: {
      proctored: initialData.proctored,
      timeLimit: initialData.timeLimit,
      allowMultipleAttempts: initialData.allowMultipleAttempts,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Edit Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSave)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Proctoring
                </Label>
                <p className="text-xs text-muted-foreground">Monitor form completion</p>
              </div>
              <Controller
                name="proctored"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit" className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Time Limit (minutes)
              </Label>
              <Controller
                name="timeLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="timeLimit"
                    type="number"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                    placeholder="No limit"
                    min="0"
                    className={errors.timeLimit ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.timeLimit && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.timeLimit.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Multiple Attempts
                </Label>
                <p className="text-xs text-muted-foreground">Allow retaking the form</p>
              </div>
              <Controller
                name="allowMultipleAttempts"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="pt-4">
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
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
