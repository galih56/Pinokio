"use client"

import { useState, useEffect } from "react"
import { addDays, endOfDay, format } from "date-fns"
import { Calendar, Clock, Copy, CheckCircle, ExternalLink, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import DialogOrDrawer from "@/components/layout/dialog-or-drawer"
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
  onGenerateLink: (itemId: string, expiresAt: Date | null) => void
  generatedLink: string | null
  isGenerating: boolean
  title?: string
  description?: string
  itemTypeLabel?: string
  defaultExpiryDays?: number
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
}: GenerateLinkDialogProps<T>) {
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [expiryTime, setExpiryTime] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)

  // Set default expiry when dialog opens OR when item changes
  useEffect(() => {
    if (isOpen && item) {
      // Use date-fns for cleaner date manipulation
      const defaultExpiry = endOfDay(addDays(new Date(), defaultExpiryDays))
      console.log(defaultExpiry);
      
      const dateStr = format(defaultExpiry, 'yyyy-MM-dd')
      const timeStr = format(defaultExpiry, 'HH:mm')

      setExpiryDate(dateStr)
      setExpiryTime(timeStr)
      setLinkCopied(false)
    }
  }, [isOpen, item, defaultExpiryDays])

  const handleGenerateLink = () => {
    if (!item) return

    let expiryDateTime = null
    if (expiryDate && expiryTime) {
      expiryDateTime = new Date(`${expiryDate}T${expiryTime}`)
    }

    onGenerateLink(item.id, expiryDateTime)
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
    <DialogOrDrawer open={isOpen} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-6">
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
            <CardDescription>Set when this link should expire (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                      colorScheme: 'light'
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
                      colorScheme: 'light'
                    }}
                  />
                </div>
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
            </CardContent>
          </Card>
        )}

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
      </div>
    </DialogOrDrawer>
  )
}