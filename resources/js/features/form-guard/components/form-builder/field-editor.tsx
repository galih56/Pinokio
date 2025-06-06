"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "./image-upload"
import RichTextEditor from "@/components/ui/text-editor"
import type { FormField } from "@/types/form"
import { Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

interface FieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

const extensions = [
  StarterKit,
  Link.configure({
    autolink: true,
    openOnClick: true,
    linkOnPaste: true,
    shouldAutoLink: (url) => url.startsWith('https://') || url.startsWith('http://'),
  }),
];

export function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  // Create editor instance for textarea fields
  const [editor] = useState(() => {
    if (field.type === "textarea") {
      return new Editor({
        extensions,
        content: field.defaultValue || '',
        editorProps: {
          attributes: {
            spellcheck: 'false',
          },
        },
      });
    }
    return null;
  });

  // Sync editor content with field default value
  useEffect(() => {
    if (editor && field.type === "textarea") {
      editor.on('update', () => {
        onUpdate({ defaultValue: editor.getHTML() });
      });

      // Set initial content if field has default value
      if (field.defaultValue && editor.getHTML() !== field.defaultValue) {
        editor.commands.setContent(field.defaultValue);
      }

      return () => {
        editor.destroy();
      };
    }
  }, [editor, field.defaultValue, onUpdate]);

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
    <div className="mx-6">
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
        <>
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
          
          <div>
            <Label>Default Content</Label>
            <div className="mt-2 border rounded-md p-3">
              {editor ? (
                <RichTextEditor editor={editor} />
              ) : (
                <div className="text-gray-500 text-sm">Rich text editor loading...</div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center space-x-2">
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
    </div>
  )
}