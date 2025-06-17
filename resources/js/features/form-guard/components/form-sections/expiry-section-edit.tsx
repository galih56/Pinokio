"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Calendar } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ExpiryDateTimeField } from "../expiry-date-time-field"

interface ExpirySectionEditProps {
  initialData: {
    expiresAt: Date | null
  }
  onSave: (data: { expiresAt: Date | null }) => void
  onCancel: () => void
  isPending: boolean
}

const expirySchema = z.object({
  expiresAt: z.date().nullable(),
})

export function ExpirySectionEdit({ initialData, onSave, onCancel, isPending }: ExpirySectionEditProps) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(expirySchema),
    defaultValues: {
      expiresAt: initialData.expiresAt,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Edit Expiry Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSave)}>
          <div className="space-y-4">
            <Controller
              name="expiresAt"
              control={control}
              render={({ field }) => (
                <ExpiryDateTimeField
                  value={field.value}
                  onChange={field.onChange}
                  label="Expiry Date & Time"
                  description="Set when this form should expire"
                  defaultExpiryDays={7}
                  allowNoExpiry={true}
                  minDate={new Date()}
                />
              )}
            />

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
