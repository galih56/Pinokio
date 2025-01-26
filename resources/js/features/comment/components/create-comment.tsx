import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CirclePicker } from "react-color"; // Import CirclePicker
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentInputSchema, useCreateComment } from '../api/create-comment';
import { useNotifications } from '@/components/ui/notifications';
import { useIsFetching } from '@tanstack/react-query';
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";

type CreateCommentType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function CreateComment({
  onSuccess,
  onError
} : CreateCommentType) { 
  const { addNotification } = useNotifications();
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
    defaultValues: {
      color: "#ffffff", // Default color value
    },
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
    createCommentMutation.mutate(values);
  }

  return (  
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name Field */}
          
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
            <Button type="submit" disabled={Boolean(isFetching)}>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
  );
}
