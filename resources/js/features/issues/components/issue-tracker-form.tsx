import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { TagCombobox } from "@/features/tags/components/tag-combobox"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload"
import { DropzoneOptions } from "react-dropzone"
import { GuestIssuerInputs } from "./guest-issuer-inputs"
import { createPublicIssueInputSchema, useCreatePublicIssue } from "../api/create-public-issue"
import RichTextEditor from "@/components/ui/text-editor"
import useGuestIssuerStore from "@/store/useGuestIssuer"
import { toast } from "sonner"
import { DateTimeInput } from "@/components/ui/date-picker/date-time-picker"

type CreateIssueType = {
  onSuccess?: () => void
  onError?: () => void
}

export default function IssueTrackerForm({ onSuccess, onError }: CreateIssueType) {
  const { loggedIn, setLoggedIn, email, name } = useGuestIssuerStore()

  const { mutate: createIssueMutation, isPending } = useCreatePublicIssue({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.()
        setLoggedIn(true);
      },
      onError: (error: any) => {
        onError?.()
        if (error?.response?.data?.errors) {
          Object.keys(error.response.data.errors).forEach((field) => {
            form.setError(field as keyof z.infer<typeof createPublicIssueInputSchema>, {
              type: "manual",
              message: error.response.data.errors[field][0], // First error message
            })
          })
        } else {
          toast.error("An error occurred")
        }
      },
    },
  })

  const form = useForm<z.infer<typeof createPublicIssueInputSchema>>({
    resolver: zodResolver(createPublicIssueInputSchema),
    defaultValues: {
      name: name || "",
      email: email || "",
    },
  })

  async function onSubmit(values: z.infer<typeof createPublicIssueInputSchema>) {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Required fields are empty")
      return
    }
    createIssueMutation(values)
  }

  const dropzoneOptions: DropzoneOptions = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
    },
    multiple: true,
    maxFiles: 4,
    maxSize: 1 * 1024 * 1024,
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Guest Issuer Inputs */}
        <GuestIssuerInputs />

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="my-3">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tag Selection */}
        <FormField
          control={form.control}
          name="tagId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Type</FormLabel>
              <FormControl>
                <TagCombobox  name={field.name} multiple={false} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <DateTimeInput
                  value={field.value || undefined}
                  onChange={field.onChange}
                  disabledDate={(date) => date < new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem className="w-full mt-2">
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value || []}
                  onValueChange={field.onChange}
                  dropzoneOptions={dropzoneOptions}
                  className="relative max-w-xs space-y-1"
                >
                  <FileInput className="border border-dashed border-gray-500">
                    <Button type="button" className="w-full" variant="outline">
                      Upload a file
                    </Button>
                  </FileInput>
                  <FileUploaderContent className="max-h-48">
                    {(field.value || []).map((file: File, index: number) => (
                      <FileUploaderItem key={index + "-" + file.name} index={index}>
                        {file.name}
                      </FileUploaderItem>
                    ))}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <DialogFooter className="my-4">
          <Button type="submit" isLoading={isPending}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
