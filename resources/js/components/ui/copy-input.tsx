"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CopyInputProps {
  value: string
  placeholder?: string
  className?: string
}

export function CopyInput({ value, placeholder, className }: CopyInputProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input value={value} placeholder={placeholder} readOnly className="font-mono text-sm" />
      <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-10 px-3">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
