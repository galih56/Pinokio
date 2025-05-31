import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommentInputSchema, useCreateComment } from '../api/create-comment';
import { useIsFetching } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import useGuestIssuerStore from '@/store/useGuestIssuer';
import { isValidEmail } from '@/lib/common';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import RichTextEditor from '@/components/ui/text-editor';
import useAuth from '@/store/useAuth';
import { toast } from 'sonner';

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

type CreateCommentType = {
  onSuccess?: Function;
  onError?: Function;
  commentableId: string;
  commentableType: string;
};

export default function CreateComment({
  onSuccess,
  onError,
  commentableId,
  commentableType,
}: CreateCommentType) {
  const { authenticated, user } = useAuth();
  const guestIssuer = useGuestIssuerStore();

  const name = authenticated ? user.name : guestIssuer.name;
  const email = authenticated ? user.email : guestIssuer.email;
  const commenterType = authenticated ? 'user' : 'guest_issuer';

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof createCommentInputSchema>>({
    resolver: zodResolver(createCommentInputSchema),
    defaultValues: {
      comment: '',
      commenterType,
      email,
      name,
    },
  });

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
      form.setValue('comment', editor.getHTML(), { shouldValidate: true });
    });

    return () => {
      editor.destroy();
    };
  }, [editor, form]);

  const createCommentMutation = useCreateComment({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
        form.reset();
        editor.commands.setContent(''); // Reset editor content
      },
      onError: () => {
        onError?.();
      },
    },
  });

  async function onSubmit(values: z.infer<typeof createCommentInputSchema>) {
    if (commenterType !== 'user' && !(name && isValidEmail(email))) {
      toast.error({
        type: 'error',
        title: 'Please enter your name and email...',
      });
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Required fields are empty');
      return;
    }

    createCommentMutation.mutate({
      commentableId,
      commentableType,
      comment: values.comment ?? '',
      userDetail: {
        email,
        name,
        commenterType,
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
          render={() => (
            <FormItem className="mt-2">
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <RichTextEditor editor={editor} />
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
            <Button type="submit" isLoading={createCommentMutation.isPending} disabled={Boolean(isFetching)}>
              Submit
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
