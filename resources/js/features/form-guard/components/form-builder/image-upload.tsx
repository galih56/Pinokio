"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X, ImageIcon } from "lucide-react"
import { PreviewableImage } from "./previewable-image"

interface ImageUploadProps {
  currentImage?: File | string
  onImageChange: (imageFile: File | undefined) => void
  label?: string
}

export function ImageUpload({ currentImage, onImageChange, label = "Add Image" }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate preview URL when currentImage changes
  useEffect(() => {
    if (currentImage instanceof File) {
      const url = URL.createObjectURL(currentImage)
      setPreviewUrl(url)
      
      // Cleanup previous URL to prevent memory leaks
      return () => URL.revokeObjectURL(url)
    } else if (typeof currentImage === "string") {
      setPreviewUrl(currentImage)
    } else {
      setPreviewUrl("")
    }
  }, [currentImage])

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageChange(file)
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

  const handleUrlSubmit = async () => {
    if (imageUrl.trim()) {
      try {
        // Fetch the image from URL and convert to File
        const response = await fetch(imageUrl.trim())
        if (!response.ok) throw new Error('Failed to fetch image')
        
        const blob = await response.blob()
        
        // Extract filename from URL or use a default name
        const urlPath = new URL(imageUrl.trim()).pathname
        const filename = urlPath.split('/').pop() || 'image.jpg'
        
        // Create File object from blob
        const file = new File([blob], filename, { type: blob.type })
        
        onImageChange(file)
        setImageUrl("")
      } catch (error) {
        console.error('Error fetching image from URL:', error)
        // You might want to show an error toast/message here
      }
    }
  }

  const removeImage = () => {
    onImageChange(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>

      {currentImage ? (
        <Card className="p-4">
          <div className="relative">
            <PreviewableImage
              image={previewUrl}
              alt={"Uploaded image"}
              className="w-full max-h-48 object-cover rounded-lg shadow-sm"
            />
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {currentImage instanceof File && (
            <div className="mt-2 text-sm text-gray-500">
              <p>File: {currentImage.name}</p>
              <p>Size: {(currentImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
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
