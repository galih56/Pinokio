"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Mail } from "lucide-react"

export default function FormUnavailable() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Form Unavailable</CardTitle>
          <CardDescription className="text-base">
            The form you're trying to access is no longer available or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>This could happen for several reasons:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>The form has reached its submission deadline</li>
              <li>The maximum number of responses has been collected</li>
              <li>The form has been temporarily disabled</li>
              <li>The link you used may be incorrect or outdated</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button className="w-full" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Need help? Please contact the form administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
