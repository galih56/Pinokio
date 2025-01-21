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
import { createTagInputSchema, useCreateTag } from '../api/create-tag';
import { useNotifications } from '@/components/ui/notifications';
import { useIsFetching } from '@tanstack/react-query';
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";

type CreateTagType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function CreateTag({
  onSuccess,
  onError
} : CreateTagType) { 
  const { addNotification } = useNotifications();
  const createTagMutation = useCreateTag({
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
  const form = useForm<z.infer<typeof createTagInputSchema>>({
    resolver: zodResolver(createTagInputSchema),
    defaultValues: {
      color: "#ffffff", // Default color value
    },
  });

  async function onSubmit(values: z.infer<typeof createTagInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
      });
      return;
    }
    createTagMutation.mutate(values);
  }

  return (  
      <Form {...form} >
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
            <Button type="submit" disabled={Boolean(isFetching)}>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
  );
}
