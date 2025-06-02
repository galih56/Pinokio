"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import type { FallbackProps } from "react-error-boundary"

export const MainErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error.name === "ChunkLoadError"
              ? "Failed to load application resources. Please refresh the page."
              : "An unexpected error occurred. Our team has been notified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.assign(window.location.origin)} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export const ComponentErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <div className="flex items-center space-x-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <h3 className="text-sm font-medium text-red-800">Error</h3>
    </div>
    <p className="text-sm text-red-700 mb-3">{error.message || "This part failed to render properly."}</p>
    <Button size="sm" onClick={resetErrorBoundary} variant="outline">
      <RefreshCw className="mr-2 h-3 w-3" />
      Retry
    </Button>
  </div>
)

export const RouteErrorFallback = ({ error }: { error: any }) => {
  const navigate = (path: string) => {
    window.location.href = path
  }

  const goBack = () => {
    window.history.back()
  }

  let errorStatus = 500
  let errorMessage = "An unexpected error occurred"

  if (error?.status) {
    errorStatus = error.status
    errorMessage = error.statusText || error.message || errorMessage
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  const getErrorContent = () => {
    switch (errorStatus) {
      case 404:
        return {
          title: "Page Not Found",
          description: "The page you are looking for does not exist.",
        }
      case 403:
        return {
          title: "Access Denied",
          description: "You do not have permission to access this resource.",
        }
      case 500:
        return {
          title: "Server Error",
          description: "Something went wrong on our end. Please try again later.",
        }
      default:
        return {
          title: "Something went wrong",
          description: errorMessage,
        }
    }
  }

  const { title, description } = getErrorContent()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={goBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
