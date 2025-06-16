import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Download, Share2 } from "lucide-react";

export function ThankYouPage({ onBack }: { onBack: () => void }) {
  const pageConfig = {
    title: "Form Submitted Successfully!",
    subtitle: "Thank you for your submission. We've received your information and will get back to you soon.",
    referenceId: "#FM-2024-001",
    confirmationDetails: [
      /*
      "Confirmation email sent",
      `Reference ID: #FM-2024-001`
      */
    ],
    nextSteps: [
      "Our team will review your submission within 24 hours",
      "You'll receive a detailed response via email",
      /*
      "Check your spam folder if needed"
      */
    ],
    supportInfo: [
      "Email: support@example.com",
      /*
      "Phone: (555) 123-4567",
      "Live chat available 9AM-5PM"
      */
    ],
    buttons: [
      {
        text: "Back to Form",
        variant: "outline",
        icon: ArrowLeft,
        action: "back"
      },
      /*
      {
        text: "Download Receipt",
        variant: "default",
        icon: Download,
        action: "download"
      },
      {
        text: "Share",
        variant: "outline",
        icon: Share2,
        action: "share"
      }
      */
    ]
  };

  const handleButtonClick = (action: string) => {
    switch (action) {
      case 'back':
        onBack();
        break;
      case 'download':
        // Handle download logic
        console.log('Download receipt');
        break;
      case 'share':
        // Handle share logic
        console.log('Share');
        break;
      default:
        break;
    }
  };

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-6 rounded-md">
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
                <h1 className="text-3xl font-bold text-green-900">{pageConfig.title}</h1>
                <p className="text-lg text-green-700">
                  {pageConfig.subtitle}
                </p>
              </div>

              {/* Confirmation Details */}
              {pageConfig.confirmationDetails.length > 0  && 
              <div className="bg-white/50 rounded-lg p-4 space-y-2">
                {pageConfig.confirmationDetails.map((detail, index) => (
                  <div key={index} className="flex items-center justify-center gap-2 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{detail}</span>
                  </div>
                ))}
              </div>}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {pageConfig.buttons.map((button, index) => {
                  const IconComponent = button.icon;
                  return (
                    <Button
                      key={index}
                      variant={button.variant as "default" | "outline"}
                      className={
                        button.variant === "outline"
                          ? "bg-white hover:bg-green-50 border-green-300 text-green-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                      onClick={() => handleButtonClick(button.action)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {button.text}
                    </Button>
                  );
                })}
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
                  {pageConfig.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{step}</span>
                    </div>
                  ))}
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
                  {pageConfig.supportInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span>{info}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}