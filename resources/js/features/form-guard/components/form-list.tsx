"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"

import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

import type { Form } from "@/types/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LinkIcon, MoreHorizontal, Calendar, Clock, Copy, CheckCircle, ExternalLink } from "lucide-react"
import { Link } from "@/components/ui/link"
import { paths } from "@/apps/dashboard/paths"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { formatDate, formatDateTime, formatTime } from "@/lib/datetime"
import { getFormQueryOptions } from "@/features/form-guard/api/get-form"
import { useForms } from "@/features/form-guard/api/get-forms"
import DialogOrDrawer from "@/components/layout/dialog-or-drawer"
import { useDisclosure } from "@/hooks/use-disclosure"
import { useGenerateFormLink } from "../api/create-form-link"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/ui/notifications"

export type FormsListProps = {
  onFormPrefetch?: (id: string) => void
}

export const FormsList = ({ onFormPrefetch }: FormsListProps) => {
  const navigate = useNavigate()
  const { addNotification } = useNotifications();
  const [choosenForm, setChoosenForm] = useState<Form | null>()
  const { isOpen, open, close, toggle } = useDisclosure()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = +(searchParams.get("page") || 1)
  const search = searchParams.get("search") || ""

  const formsQuery = useForms({
    page: currentPage,
    search,
  })

  const [searchTerm, setSearchTerm] = useState(search)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [expiryTime, setExpiryTime] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)

  const generateFormLinkMutation = useGenerateFormLink({
    mutationConfig: {
      onSuccess: (form) => {
        setGeneratedLink(form.formUrl || null)
      },
    },
  })

  const handleGenerateLink = (form: Form) => {
    setChoosenForm(form)
    setGeneratedLink(null)
    setLinkCopied(false)

    // Set default expiry to 7 days from now
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 7)

    const dateStr = defaultExpiry.toISOString().split("T")[0]
    const timeStr = defaultExpiry.toTimeString().slice(0, 5)

    setExpiryDate(dateStr)
    setExpiryTime(timeStr)

    open()
  }

  const handleGenerateLinkWithExpiry = () => {
    if (!choosenForm) return

    let expiryDateTime = null
    if (expiryDate && expiryTime) {
      expiryDateTime = new Date(`${expiryDate}T${expiryTime}`)
    }

    generateFormLinkMutation.mutate({
      formId: choosenForm.id,
      expiresAt: expiryDateTime,
    })
  }

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink)
      setLinkCopied(true)
      addNotification({
        title: "Link Copied",
        message: "Form link has been copied to clipboard",
        type: 'info',
        toast: true
      })
      setTimeout(() => setLinkCopied(false), 2000)
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

  useEffect(() => {
    // Sync the search term with query parameters
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (searchTerm) {
          params.set("search", searchTerm)
        } else {
          params.delete("search")
        }
        return params
      })
    }, 300) // Add debounce to avoid excessive API calls

    return () => clearTimeout(timeout)
  }, [searchTerm, setSearchParams])

  const queryClient = useQueryClient()

  const forms = formsQuery.data?.data || []
  const meta = formsQuery.data?.meta

  const columns: ColumnDef<Form>[] = [
    {
      id: "actions",
      cell: ({ row }) => {
        const form = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link
                onMouseEnter={() => {
                  queryClient.prefetchQuery(getFormQueryOptions(form.id))
                  onFormPrefetch?.(form.id)
                }}
                to={paths.form.getHref(form.id)}
              >
                <DropdownMenuItem>View</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => handleGenerateLink(form)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Generate Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },

    {
      accessorKey: "title",
      header: "Title",
      meta: { cellClassName: "max-w-[40vh]" },
      cell: ({ row }) => {
        const form = row.original

        return (
          <div>
            <Link
              onMouseEnter={() => {
                queryClient.prefetchQuery(getFormQueryOptions(form.id))
                onFormPrefetch?.(form.id)
              }}
              to={paths.form.getHref(form.id)}
            >
              <p>{form.title}</p>
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const form = row.original
        if (!form.createdAt) return "-"

        return (
          <span className="text-xs text-nowrap">
            {formatDate(form.createdAt)} <br />
            {formatTime(form.createdAt)}
          </span>
        )
      },
    },
  ]
  const onPageChange = (newPage: number) => {
    queryClient.setQueryData(["forms", { page: newPage }], formsQuery.data)
    navigate(`?page=${newPage}`)
    formsQuery.refetch()
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {formsQuery.isPending ? (
        <Skeleton className="w-full min-h-[60vh]" />
      ) : forms.length > 0 ? (
        <DataTable
          data={forms}
          columns={columns}
          pagination={
            meta && {
              totalPages: meta.totalPages,
              perPage: meta.perPage,
              totalCount: meta.totalCount,
              currentPage: meta.currentPage,
              rootUrl: import.meta.env.VITE_BASE_URL,
            }
          }
          onPaginationChange={onPageChange}
        />
      ) : (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <p className="text-gray-500">No forms found.</p>
        </div>
      )}

      {choosenForm && choosenForm.id && (
        <DialogOrDrawer open={isOpen} onOpenChange={toggle} title={"Generate Form Link"}>
          <div className="space-y-6">
            {/* Form Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  {choosenForm.title}
                </CardTitle>
                <CardDescription>Generate a shareable link for this form with custom expiry settings</CardDescription>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date" className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry-time" className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Expiry Time
                    </Label>
                    <Input
                      id="expiry-time"
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
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
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateLinkWithExpiry}
                disabled={generateFormLinkMutation.isPending || isExpired()}
                className="w-full sm:w-auto"
              >
                {generateFormLinkMutation.isPending ? (
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

            {generateFormLinkMutation.isPending && (
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
      )}
    </div>
  )
}
