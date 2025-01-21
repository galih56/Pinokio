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
import { useNotifications } from '@/components/ui/notifications';
import { Authorization, ROLES } from '@/lib/authorization';
import { useTag } from '../api/get-tag';
import {
  updateTagInputSchema,
  useUpdateTag,
} from '../api/update-tag';
import { useIsFetching } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';
import { CirclePicker } from 'react-color';
import { ColorPickerPopover } from '@/components/ui/color-picker-popover';

type UpdateTagProps = {
  tagId: string | undefined;
  onSuccess? : ( ) => void;
  onError? : ( ) => void;
};

export const UpdateTag = ({ tagId , onSuccess, onError}: UpdateTagProps) => {
  const { addNotification } = useNotifications();

  if (!tagId) {
    return null;
  }

  const tagQuery = useTag({ tagId });
  const updateTagMutation = useUpdateTag({
    mutationConfig: {
      onSuccess: onSuccess,
      onError: onError,
    },
  });

  const tag = tagQuery.data?.data;

  if (!tag || tagQuery.isPending) {
    return null;
  }


  const form = useForm<z.infer<typeof updateTagInputSchema>>({
    resolver: zodResolver(updateTagInputSchema),
    defaultValues: {
      name: tag?.name,        // Set default value for name
      color: tag?.color || '#ffffff', // Set default color (fallback to white)
    },
  });

  async function onSubmit(values: z.infer<typeof updateTagInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
      });
      return;
    }
    updateTagMutation.mutate({ data: values, tagId: tag?.id! });
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
              <FormLabel className="whitespace-nowrap">Choose a Tag Color : </FormLabel>
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
            <Button type="submit" isLoading={updateTagMutation.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};
