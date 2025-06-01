"use client"

import { useState, useEffect } from "react"
import { addDays, endOfDay, format } from "date-fns"
import { Calendar, Clock, Copy, CheckCircle, ExternalLink, LinkIcon, Send, Share2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/datetime"
import { toast } from "sonner"

export interface GenerateLinkItem {
  id: string
  title: string
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
  title = "Generate Link",
  description = "Generate a shareable link with custom expiry settings",
  itemTypeLabel = "item",
  defaultExpiryDays = 7,
  previousLinks = [],
}: GenerateLinkDialogProps<T>) {
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [expiryTime, setExpiryTime] = useState<string>("")
  const [timeLimit, setTimeLimit] = useState<number>(15) // Default 15 minutes
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("generate")

  // Set default expiry when dialog opens OR when item changes
  useEffect(() => {
    if (isOpen && item) {
      const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))

      const dateStr = format(defaultExpiry, "yyyy-MM-dd")
      const timeStr = format(defaultExpiry, "HH:mm")

      setExpiryDate(dateStr)
      setExpiryTime(timeStr)
      setLinkCopied(false)
      setTimeLimit(item.timeLimit)
    }
  }, [isOpen, item, defaultExpiryDays])

  const handleGenerateLink = () => {
    if (!item) return

    let expiryDateTime = null
    if (expiryDate && expiryTime) {
      expiryDateTime = new Date(`${expiryDate}T${expiryTime}`)
    }

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

  const getExpiryDateTime = () => {
    if (expiryDate && expiryTime) {
      return new Date(`${expiryDate}T${expiryTime}`)
    }
    return null
  }

  const isExpired = () => {
    const expiry = getExpiryDateTime()
    return expiry ? expiry < new Date() : false
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

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

            {/* Expiry Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Link Expiry Settings
                </CardTitle>
                <CardDescription>Set when this link should expire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Expiry Date/Time : </Label>
                  </div>
                  <div className="flex gap-3 sm:flex-shrink-0">
                    <div className="w-full sm:w-auto">
                      <Input
                        id="expiry-date"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        placeholder="Select date"
                        style={{
                          colorScheme: "light",
                        }}
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <Input
                        id="expiry-time"
                        type="time"
                        value={expiryTime}
                        onChange={(e) => setExpiryTime(e.target.value)}
                        placeholder="Select time"
                        style={{
                          colorScheme: "light",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Time Limit Setting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Time Limit (minutes): </Label>
                  </div>
                  <div className="w-full sm:w-32">
                    <Input
                      id="time-limit"
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 15)}
                      min={1}
                      max={180}
                      placeholder="Minutes"
                    />
                  </div>
                </div>

                {expiryDate && expiryTime && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Link will expire:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isExpired() ? "destructive" : "secondary"}>
                          {formatDateTime(getExpiryDateTime()!)}
                        </Badge>
                        {isExpired() && <Badge variant="destructive">Expired</Badge>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Responder will have <strong>{timeLimit} minutes</strong> to complete the assessment once they open
                      the link.
                    </span>
                  </div>
                </div>
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
                    Generate Link
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

                  {expiryDate && expiryTime && (
                    <div className="text-xs text-muted-foreground text-center">
                      This link will expire on {formatDateTime(getExpiryDateTime()!)}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground text-center">
                    Time limit: {timeLimit} minutes once opened
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
      </DialogContent>
    </Dialog>
  )
}
