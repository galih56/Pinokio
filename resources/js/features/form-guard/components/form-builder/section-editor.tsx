"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import type { FormSection } from "@/types/form"

interface SectionEditorProps {
  section: FormSection
  onUpdate: (updates: Partial<FormSection>) => void
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  return (
    <div className="mx-6">
      <div>
        <Label htmlFor="section-title">Section Title</Label>
        <Input
          id="section-title"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter section title"
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
        onImageChange={(imageUrl) => onUpdate({ image: imageUrl })}
        label="Section Image"
      />

      <div className="text-sm text-gray-500">
        This section contains {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
