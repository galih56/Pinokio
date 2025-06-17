import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react"

export function FormErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">Form Rendering Error</AlertTitle>
        <AlertDescription className="text-red-800">
          Something went wrong while rendering the form: {error.message}
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="h-8">
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-8 text-red-700 hover:text-red-900"
            >
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}