import { Loader2, Pen } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from '@/components/ui/button';
import { Authorization, ROLES } from '@/lib/authorization';
import { useComment } from '../api/get-comment';
import {
  updateCommentInputSchema,
  useUpdateComment,
} from '../api/update-comment';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';
import { ColorPickerPopover } from '@/components/ui/color-picker-popover';
import { toast } from 'sonner';

type UpdateCommentProps = {
  commentId: string | undefined;
  onSuccess? : ( ) => void;
  onError? : ( ) => void;
};

export const UpdateComment = ({ commentId , onSuccess, onError}: UpdateCommentProps) => {

  if (!commentId) {
    return null;
  }

  const commentQuery = useComment({ commentId });
  const updateCommentMutation = useUpdateComment({
    mutationConfig: {
      onSuccess: onSuccess,
      onError: onError,
    },
  });

  const comment = commentQuery.data?.data;

  if (!comment || commentQuery.isPending) {
    return null;
  }


  const form = useForm<z.infer<typeof updateCommentInputSchema>>({
    resolver: zodResolver(updateCommentInputSchema),
    defaultValues: {
      name: comment?.name,        // Set default value for name
      color: comment?.color || '#ffffff', // Set default color (fallback to white)
    },
  });

  async function onSubmit(values: z.infer<typeof updateCommentInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Required fields are empty');
      return;
    }
    updateCommentMutation.mutate({ data: values, commentId: comment?.id! });
  }

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Picker Field */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem className="mt-4 flex items-center space-x-4 space-y-0">
              <FormLabel className="whitespace-nowrap">Choose a Comment Color : </FormLabel>
                <FormControl>
                  <ColorPickerPopover
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="my-4">
            <Button type="submit" isLoading={updateCommentMutation.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};
