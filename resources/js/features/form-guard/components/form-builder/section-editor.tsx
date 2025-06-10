"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import type { FormSection } from "@/types/form"
import { FileUploader } from "@/components/ui/file-upload"

interface SectionEditorProps {
  section: FormSection
  onUpdate: (updates: Partial<FormSection>) => void
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  return (
    <div className="mx-6">
      <div>
        <Label htmlFor="section-name">Section Name</Label>
        <Input
          id="section-name"
          value={section.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Enter section name"
        />
      </div>

      <div>
        <Label htmlFor="section-description">Section Description</Label>
        <Textarea
          id="section-description"
          value={section.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter section description (optional)"
          rows={3}
        />
      </div>

      <ImageUpload
        currentImage={section.image}
        onImageChange={(image) => onUpdate({ image: image })}
        label="Section Image"
      />

      <div className="text-sm text-gray-500">
        This section contains {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
