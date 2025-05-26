
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
import { useNotifications } from '@/components/ui/notifications';
import DateTimePickerInput from "@/components/ui/date-picker/date-picker-input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/text-editor";
import { CreateFormInput, createFormInputSchema, useCreateForm } from "../api/create-form";
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

type CreateFormType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function CreateForm({
  onSuccess,
  onError
} : CreateFormType) { 
  const { addNotification } = useNotifications();

  const { mutate: createFormMutation, isPending } = useCreateForm({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: any) => {
        onError?.();
        if (error?.response?.data?.errors) {
          // Map the errors to React Hook Form `setError`
          Object.keys(error.response.data.errors).forEach((field) => {
            form.setError(field as keyof CreateFormInput, {
              type: 'manual',
              message: error.response.data.errors[field][0], // Display the first error message
            });
          });
        } else {
          addNotification({
            type: 'error',
            title: 'An error occurred',
            toast: true
          });
        }
      },
    },
  });
  
  const form = useForm<z.infer<typeof createFormInputSchema>>({
    resolver: zodResolver(createFormInputSchema)
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

  async function onSubmit(values: z.infer<typeof createFormInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true
      });
      return;
    }
    createFormMutation(values)
  }
  
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
              name="description"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor editor={editor} />   
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field , formState : { errors }  }) => (
                <FormItem className="my-2">
                  <FormLabel>Form Type</FormLabel>
                  <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Form Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key='internal' value='internal'>
                              Internal
                            </SelectItem>
                            <SelectItem key='google-form' value='google-form'>
                              Google Form
                            </SelectItem>
                        </SelectContent>
                      </Select>
                  </FormControl>
                  {errors.type && <FormMessage> {errors.type.message} </FormMessage>}
                </FormItem>
              )}
            />
            {/* <FormField
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
            /> */}
          <DialogFooter className="my-4">
            <Button type="submit" isLoading={isPending}>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
  )
}
