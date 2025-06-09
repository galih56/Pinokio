"use client"

import { useState, useEffect } from "react"
import { formatDuration, intervalToDuration } from "date-fns"
import { Copy, CheckCircle, ExternalLink, LinkIcon, Send, Share2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/datetime"
import { toast } from "sonner"
import { TimeLimitField } from "../time-limit-field"
import { ExpiryDateTimeField } from "../expiry-date-time-field"
import DialogOrDrawer from "@/components/layout/dialog-or-drawer"

export interface GenerateLinkItem {
  id: string
  title: string
  timeLimit?: number // in seconds
  [key: string]: any
}

export interface GenerateLinkDialogProps<T extends GenerateLinkItem> {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: T | null
  onGenerateLink: (itemId: string, expiresAt: Date | null, timeLimit?: number) => void
  generatedLink: string | null
  isGenerating: boolean
  title?: string
  description?: string
  itemTypeLabel?: string
  defaultExpiryDays?: number
  previousLinks?: Array<{ id: string; url: string; createdAt: Date; expiresAt?: Date; used: boolean }>
}

export function GenerateLinkDialog<T extends GenerateLinkItem>({
  isOpen,
  onOpenChange,
  item,
  onGenerateLink,
  generatedLink,
  isGenerating,
  title = "Get the link",
  description = "Generate a shareable link with custom expiry settings",
  itemTypeLabel = "item",
  defaultExpiryDays = 7,
  previousLinks = [],
}: GenerateLinkDialogProps<T>) {
  const [expiryDateTime, setExpiryDateTime] = useState<Date | null>(null)
  const [timeLimit, setTimeLimit] = useState<number>(900) // Default 15 minutes in seconds
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("generate")

  // Set defaults when dialog opens OR when item changes
  useEffect(() => {
    if (isOpen && item) {
      setLinkCopied(false)

      // Set time limit from item or default to 15 minutes (900 seconds)
      setTimeLimit(item.timeLimit || 900)

      // ExpiryDateTime will be set by the ExpiryDateTimeInput component
      // based on its defaultExpiryDays prop
    }
  }, [isOpen, item, defaultExpiryDays])

  const handleGenerateLink = () => {
    if (!item) return

    onGenerateLink(item.id, expiryDateTime, timeLimit)

    // Switch to share tab after generating
    if (!generatedLink) {
      setTimeout(() => setActiveTab("share"), 500)
    }
  }

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setLinkCopied(true)
      toast.info("Link Copied", { description: `${itemTypeLabel} link has been copied to clipboard` })
      setTimeout(() => setLinkCopied(false), 1000)
    }
  }

  const isExpired = () => {
    return expiryDateTime ? expiryDateTime < new Date() : false
  }

  // Format time limit for display
  const formatTimeLimitDisplay = (seconds: number) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    }

    return formatDuration(duration, {
      format: ["hours", "minutes"],
      delimiter: " ",
    })
  }

  if (!item) return null

  return (
    <DialogOrDrawer title={title} open={isOpen} onOpenChange={onOpenChange}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="share" disabled={!generatedLink}>
              Share
            </TabsTrigger>
            <TabsTrigger value="history" disabled={previousLinks.length === 0}>
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Item Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  {item.title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Link Settings</CardTitle>
                <CardDescription>Configure when this link should expire</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpiryDateTimeField
                  value={expiryDateTime}
                  onChange={setExpiryDateTime}
                  label="Link Expiry"
                  description="Set when this link should expire"
                  defaultExpiryDays={defaultExpiryDays}
                  allowNoExpiry={true}
                  presets={[
                    { label: "1 hour", days: 0.04 }, // ~1 hour
                    { label: "1 day", days: 1 },
                    { label: "3 days", days: 3 },
                    { label: "1 week", days: 7 },
                    { label: "2 weeks", days: 14 },
                    { label: "1 month", days: 30 },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Time Limit Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assessment Time Limit</CardTitle>
                <CardDescription>Set how long responders have to complete the assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <TimeLimitField
                  value={timeLimit}
                  onChange={setTimeLimit}
                  label="Time Limit"
                  description="Responders will have this amount of time to complete the assessment once they open the link"
                  presets={[
                    { label: "5 min", seconds: 300 },
                    { label: "10 min", seconds: 600 },
                    { label: "15 min", seconds: 900 },
                    { label: "30 min", seconds: 1800 },
                    { label: "45 min", seconds: 2700 },
                    { label: "1 hour", seconds: 3600 },
                    { label: "1.5 hours", seconds: 5400 },
                    { label: "2 hours", seconds: 7200 },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button onClick={handleGenerateLink} disabled={isGenerating || isExpired()} className="w-full sm:w-auto">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Get the link
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-6">
            {/* Generated Link Display */}
            {generatedLink && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Link Generated Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted border rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Generated Link:</p>
                        <p className="text-sm font-mono break-all">{generatedLink}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                      {linkCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => window.open(generatedLink, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>

                  {expiryDateTime && (
                    <div className="text-xs text-muted-foreground text-center">
                      This link will expire on {formatDateTime(expiryDateTime)}
                    </div>
                  )}

                  {!expiryDateTime && (
                    <div className="text-xs text-muted-foreground text-center">This link has no expiry date</div>
                  )}

                  <div className="text-xs text-muted-foreground text-center">
                    Time limit: {formatTimeLimitDisplay(timeLimit)} once opened
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Copy and share the assessment link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                    {linkCopied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => window.open(generatedLink, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `Assessment: ${item.title}`,
                          text: `Complete this assessment: ${item.title}`,
                          url: generatedLink || "",
                        })
                        .catch(() => {
                          copyToClipboard()
                        })
                    } else {
                      copyToClipboard()
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Link is ready to be sent to candidates through your recruitment system.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Previously Generated Links
                </CardTitle>
                <CardDescription>History of links generated for this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previousLinks.length > 0 ? (
                  <div className="space-y-3">
                    {previousLinks.map((link) => (
                      <div key={link.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={link.used ? "secondary" : "default"}>{link.used ? "Used" : "Unused"}</Badge>
                            {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Created: {formatDateTime(link.createdAt)}
                          </p>
                          {link.expiresAt && (
                            <p className="text-xs text-muted-foreground truncate">
                              Expires: {formatDateTime(link.expiresAt)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(link.url)
                              toast.info("Link Copied")
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">No previous links found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {isGenerating && !generatedLink && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        )}
      </DialogOrDrawer>
  )
}
