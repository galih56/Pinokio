import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Download, Share2 } from "lucide-react";

export function ThankYouPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Alert-Style Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {/* Main Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-green-900">Form Submitted Successfully!</h1>
                <p className="text-lg text-green-700">
                  Thank you for your submission. We've received your information and will get back to you soon.
                </p>
              </div>

              {/* Confirmation Details */}
              <div className="bg-white/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Confirmation email sent</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Reference ID: #FM-2024-001</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="bg-white hover:bg-green-50 border-green-300 text-green-700"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Demo
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="bg-white hover:bg-green-50 border-green-300 text-green-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Cards */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Card className="border-green-100">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  What happens next?
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Our team will review your submission within 24 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>You'll receive a detailed response via email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Check your spam folder if needed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Need help?
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>Email: support@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>Phone: (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span>Live chat available 9AM-5PM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}