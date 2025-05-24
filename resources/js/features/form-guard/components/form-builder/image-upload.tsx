"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string | undefined) => void
  label?: string
}

export function ImageUpload({ currentImage, onImageChange, label = "Add Image" }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // In a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
      // For demo purposes, we'll create a blob URL
      const url = URL.createObjectURL(file)
      onImageChange(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageChange(imageUrl.trim())
      setImageUrl("")
    }
  }

  const removeImage = () => {
    onImageChange(undefined)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>

      {currentImage ? (
        <Card className="p-4">
          <div className="relative">
            <img
              src={currentImage || "/placeholder.svg"}
              alt="Uploaded image"
              className="w-full max-h-48 object-cover rounded-lg"
            />
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
              <Button variant="outline" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
                <Link className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Enter a direct link to an image (e.g., https://example.com/image.jpg)
            </p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
