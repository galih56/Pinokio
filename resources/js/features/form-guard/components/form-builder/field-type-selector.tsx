"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FieldType } from "@/types/form"
import { Type, Mail, Phone, Calendar, ToggleLeft, List, CheckSquare, FileText, Hash, Link } from "lucide-react"

interface FieldTypeSelectorProps {
  onAddField: (type: FieldType) => void
  targetSection?: string
}

const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { type: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { type: "tel", label: "Phone", icon: <Phone className="h-4 w-4" /> },
  { type: "number", label: "Number", icon: <Hash className="h-4 w-4" /> },
  { type: "date", label: "Date", icon: <Calendar className="h-4 w-4" /> },
  { type: "url", label: "URL", icon: <Link className="h-4 w-4" /> },
  { type: "textarea", label: "Long Text", icon: <FileText className="h-4 w-4" /> },
  { type: "select", label: "Dropdown", icon: <List className="h-4 w-4" /> },
  { type: "radio", label: "Multiple Choice", icon: <ToggleLeft className="h-4 w-4" /> },
  { type: "checkbox", label: "Checkboxes", icon: <CheckSquare className="h-4 w-4" /> },
]

export function FieldTypeSelector({ onAddField, targetSection }: FieldTypeSelectorProps) {
  return (
    <div className="mx-6">
      <div className="text-base text-gray-600 mb-2">
        {targetSection ? (
          <>
            Adding to: <span className="font-medium text-blue-600">{targetSection}</span>
          </>
        ) : (
          <span className="text-amber-600">Select a section first</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {fieldTypes.map((fieldType) => (
          <Button
            key={fieldType.type}
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => onAddField(fieldType.type)}
            disabled={!targetSection || targetSection === "No sections available"}
          >
            <div className="flex items-center gap-3">
              {fieldType.icon}
              <span>{fieldType.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
