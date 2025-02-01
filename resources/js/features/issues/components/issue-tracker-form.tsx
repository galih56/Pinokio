
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod";
import { TagCombobox } from "@/features/tags/components/tag-combobox";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotifications } from '@/components/ui/notifications';
import DateTimePickerInput from "@/components/ui/date-picker/date-picker-input";
import { Textarea } from "@/components/ui/textarea";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/components/ui/file-upload";
import { DropzoneOptions } from "react-dropzone";
import { GuestUserInputs } from "./guest-user-inputs";
import { createPublicIssueInputSchema, useCreatePublicIssue } from "../api/create-public-issue";

type CreateIssueType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function IssueTrackerForm({
  onSuccess,
  onError
} : CreateIssueType) { 
  const { addNotification } = useNotifications();

  const { mutate: createIssueMutation, isPending } = useCreatePublicIssue({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: any) => {
        onError?.();
        if (error?.response?.data?.errors) {
          // Map the errors to React Hook Form `setError`
          Object.keys(error.response.data.errors).forEach((field) => {
            form.setError(field as keyof CreatePublicIssueInput, {
              type: 'manual',
              message: error.response.data.errors[field][0], // Display the first error message
            });
          });
        } else {
          addNotification({
            type: 'error',
            title: 'An error occurred',
          });
        }
      },
    },
  });
  
  const form = useForm<z.infer<typeof createPublicIssueInputSchema>>({
    resolver: zodResolver(createPublicIssueInputSchema)
  })
  

  async function onSubmit(values: z.infer<typeof createPublicIssueInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
      });;
      return;
    }
    createIssueMutation(values)
  }
  
  const dropzoneOptions = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: true,
    maxFiles: 4,
    maxSize: 1 * 1024 * 1024,
  } satisfies DropzoneOptions;
  

  return (  
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <GuestUserInputs />
            <FormField
              control={form.control}
              name="title"
              render={({ field , formState : { errors }  }) => (    
              <FormItem className='my-3'>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                      <Input {...field} placeholder="Title" />
                  </FormControl>
                  <FormMessage/>
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagId"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Issue Type</FormLabel>
                  <FormControl> 
                    <TagCombobox
                        multiple={false} 
                        {...field} 
                      />
                  </FormControl>
                  <FormMessage>{errors.tagId?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field , formState : { errors }  }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DateTimePickerInput
                      value={field.value || undefined}
                      onChange={field.onChange}
                      disabledDate={(date) => date < new Date()}
                    />
                  </FormControl>
                  {errors.dueDate && <FormMessage> {errors.dueDate.message} </FormMessage>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem
                  className="w-full mt-2"
                  >
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={(field.value || [])}
                      onValueChange={field.onChange}
                      dropzoneOptions={dropzoneOptions}
                      className="relative max-w-xs space-y-1"
                    >
                      <FileInput className="border border-dashed border-gray-500">
                        <Button type="button" className="w-full" variant={"outline"}>Upload a file</Button>
                      </FileInput>
                      <FileUploaderContent className="max-h-48 ">
                        {(field.value || []).length > 0 && (field.value || []).map((file: File, index: number) => (<FileUploaderItem index={index}>{file.name}</FileUploaderItem>))}
                      </FileUploaderContent>
                    </FileUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <DialogFooter className="my-4">
            <Button type="submit" isLoading={isPending}>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
  )
}
