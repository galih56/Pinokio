import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommentInputSchema, useCreateComment } from '../api/create-comment';
import { useNotifications } from '@/components/ui/notifications';
import { useIsFetching } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import useGuestIssuerStore from '@/store/useGuestIssuer';
import { isValidEmail } from '@/lib/common';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import RichTextEditor from '@/components/ui/text-editor';


type CreateCommentType = {
  onSuccess?: Function;
  onError?: Function;
  commentableId: string; 
  commentableType: string;
  commenterType: 'GuestIssuer' | 'User';
};

export default function CreateComment({
  onSuccess,
  onError,
  commentableId,
  commentableType,
  commenterType
}: CreateCommentType) {
  const { addNotification } = useNotifications();
  const { name, email } = useGuestIssuerStore();
  const createCommentMutation = useCreateComment({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: () => {
        onError?.();
      },
    },
  });

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof createCommentInputSchema>>({
    resolver: zodResolver(createCommentInputSchema),
    defaultValues : {
      comment : '',
      commenterType : commenterType,
      email,
      name
    }
  });
  console.log(form.formState.errors, commenterType)

  async function onSubmit(values: z.infer<typeof createCommentInputSchema>) {
    if (commenterType != 'User' && !(name && isValidEmail(email))) {
      addNotification({
        type: 'error',
        title: 'Please enter your name and email...',
        toast: true,
      });
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true,
      });
      return;
    }


    createCommentMutation.mutate({
      commentableId, 
      commentableType,
      comment: values.comment ?? '',
      userDetail: {
        email: email,
        name: name,
        commenterType: commenterType,
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Comment Field */}
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Comment</FormLabel>
              <FormControl>
                  <RichTextEditor  {...field}/>
              </FormControl>
              <div className="flex flex-row space-x-2 items-center mt-2">
                <h6 className="text-sm font-bold">{name}</h6>
                <span className="text-gray-600 text-xs italic">{email}</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="my-4">
          <div className="flex flex-col">
            <Button type="submit" disabled={Boolean(isFetching)}>
              Submit
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
