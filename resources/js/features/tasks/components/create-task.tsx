
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/components/ui/file-upload";
import { DropzoneOptions } from "react-dropzone";
import RichTextEditor from "@/components/ui/text-editor";
import { CreateTaskInput, createTaskInputSchema, useCreateTask } from "../api/create-task";
import { useEffect, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Editor } from '@tiptap/react';
import { toast } from "sonner";
import { DateTimeInput } from "@/components/ui/date-picker/date-time-picker";

// Editor extensions
const extensions = [
  StarterKit,
  Link.configure({
    autolink: true,
    openOnClick: true,
    linkOnPaste: true,
    shouldAutoLink: (url) => url.startsWith('https://') || url.startsWith('http://'),
  }),
];

type CreateTaskType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function CreateTask({
  onSuccess,
  onError
} : CreateTaskType) { 
  const { mutate: createTaskMutation, isPending } = useCreateTask({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: any) => {
        onError?.();
        if (error?.response?.data?.errors) {
          // Map the errors to React Hook Form `setError`
          Object.keys(error.response.data.errors).forEach((field) => {
            form.setError(field as keyof CreateTaskInput, {
              type: 'manual',
              message: error.response.data.errors[field][0], // Display the first error message
            });
          });
        } else {
          toast.error('An error occurred');
        }
      },
    },
  });
  
  const form = useForm<z.infer<typeof createTaskInputSchema>>({
    resolver: zodResolver(createTaskInputSchema)
  })
  
  // Instantiate Editor outside of component state
  const [editor] = useState(
    new Editor({
      extensions,
      content: '',
      editorProps: {
        attributes: {
          spellcheck: 'false',
        },
      },
    })
  );

  // Sync editor content with form state
  useEffect(() => {
    editor.on('update', () => {
      form.setValue('description', editor.getHTML(), { shouldValidate: true });
    });

    return () => {
      editor.destroy();
    };
  }, [editor, form]);

  async function onSubmit(values: z.infer<typeof createTaskInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Required fields are empty');
      return;
    }
    createTaskMutation(values)
  }
  
  const dropzoneOptions = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"], 
      "application/msword": [".doc"], 
    },
    multiple: true,
    maxFiles: 4,
    maxSize: 1 * 1024 * 1024,
  } satisfies DropzoneOptions;
  

  return (  
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
              name="tagIds"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <FormControl> 
                    <TagCombobox
                        multiple={true} 
                        name={field.name}
                      />
                  </FormControl>
                  <FormMessage>{errors.tagIds?.message}</FormMessage>
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
                    <DateTimeInput
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
                    <RichTextEditor  editor={editor} />     
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
                      className="relative space-y-1"
                    >
                      <FileInput className="border border-dashed border-gray-500">
                        <Button type="button" className="w-full" variant={"outline"}>Upload a file</Button>
                      </FileInput>
                      <FileUploaderContent className="max-h-48 ">
                        {(field.value || []).length > 0 && (field.value || []).map((file: File, index: number) => (<FileUploaderItem key={index+"-"+file.name} index={index}>{file.name}</FileUploaderItem>))}
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
