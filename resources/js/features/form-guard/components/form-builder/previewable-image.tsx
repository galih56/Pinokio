import { useImagePreviewerStore } from "@/components/ui/image-previewer"
import { useEffect, useState } from "react"

interface ImageSource {
  url?: string        // Actual URL from backend
  file?: File         // File object for uploads
  preview?: string    // Blob URL for preview
}

interface PreviewableImageProps {
  image?: string | File | ImageSource
  alt: string
  className?: string
}

export const PreviewableImage = ({ image, alt, className }: PreviewableImageProps) => {
  const [displayUrl, setDisplayUrl] = useState<string>("");
  const { setSelectedImage } = useImagePreviewerStore()
  
  useEffect(() => {
    if (!image) {
      setDisplayUrl("")
      return
    }

    // Handle different input types
    if (typeof image === 'string') {
      // Simple string URL
      setDisplayUrl(image)
    } else if (image instanceof File) {
      // File object - create blob URL
      const url = URL.createObjectURL(image)
      setDisplayUrl(url)
      return () => URL.revokeObjectURL(url)
    } else if (typeof image === 'object') {
      // ImageSource object - priority: url > preview > file
      if (image.url) {
        setDisplayUrl(image.url)
      } else if (image.preview) {
        setDisplayUrl(image.preview)
      } else if (image.file) {
        const url = URL.createObjectURL(image.file)
        setDisplayUrl(url)
        return () => URL.revokeObjectURL(url)
      } else {
        setDisplayUrl("")
      }
    }
  }, [image])

  if (!displayUrl) {
    return null // Don't render anything if no image
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      onClick={() => setSelectedImage(displayUrl)}
      onError={(e) => {
        e.currentTarget.src = "/assets/images/placeholder.svg"
      }}
    />
  )
}
