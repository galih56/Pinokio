import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommentInputSchema, useCreateComment } from '../api/create-comment';
import { useNotifications } from '@/components/ui/notifications';
import { useIsFetching } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

type CreateCommentType = {
  onSuccess?: Function;
  onError?: Function;
  commentableId: string; // Add commentableId as a prop
  commentableType: string; // Add commentableType as a prop
};

export default function CreateComment({
  onSuccess,
  onError,
  commentableId,
  commentableType,
}: CreateCommentType) {
  const { addNotification } = useNotifications();
  const createCommentMutation = useCreateComment({
    commentableId, // Pass commentableId
    commentableType, // Pass commentableType
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
  });

  async function onSubmit(values: z.infer<typeof createCommentInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
      });
      return;
    }
    createCommentMutation.mutate(values.comment); // Only pass the comment value
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
                <Textarea
                  placeholder="Comment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="my-4">
          <Button type="submit" disabled={Boolean(isFetching)}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}