"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "./image-upload"
import type { FormField } from "@/types/form"
import { Plus, X } from "lucide-react"

interface FieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const addOption = () => {
    const currentOptions = field.options || []
    onUpdate({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index)
    onUpdate({ options: newOptions })
  }

  const hasOptions = field.type === "select" || field.type === "radio" || field.type === "checkbox"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <ImageUpload
          currentImage={field.image}
          onImageChange={(imageUrl) => onUpdate({ image: imageUrl })}
          label="Field Image"
        />

        {field.type === "textarea" && (
          <div>
            <Label htmlFor="field-rows">Rows</Label>
            <Input
              id="field-rows"
              type="number"
              min="1"
              max="10"
              value={field.rows || 3}
              onChange={(e) => onUpdate({ rows: Number.parseInt(e.target.value) || 3 })}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
          <Label htmlFor="field-required">Required field</Label>
        </div>

        {hasOptions && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={(field.options?.length || 0) <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {field.type === "number" && (
          <>
            <div>
              <Label htmlFor="field-min">Minimum Value</Label>
              <Input
                id="field-min"
                type="number"
                value={field.min || ""}
                onChange={(e) => onUpdate({ min: e.target.value ? Number.parseInt(e.target.value) : undefined })}
                placeholder="Enter minimum value"
              />
            </div>
            <div>
              <Label htmlFor="field-max">Maximum Value</Label>
              <Input
                id="field-max"
                type="number"
                value={field.max || ""}
                onChange={(e) => onUpdate({ max: e.target.value ? Number.parseInt(e.target.value) : undefined })}
                placeholder="Enter maximum value"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
