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
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

type UpdateTagProps = {
  tagId: string;
  onSuccess? : ( ) => void;
  onError? : ( ) => void;
};

export const UpdateTag = ({ tagId , onSuccess, onError}: UpdateTagProps) => {
  const tagQuery = useTag({ tagId });
  const updateTagMutation = useUpdateTag({
    tagId : tagId,
    config: {
      onSuccess: onSuccess,
      onError: onError,
    },
  });

  const tag = tagQuery.data?.data;

  const form = useForm<z.infer<typeof updateTagInputSchema>>({
    resolver: zodResolver(updateTagInputSchema),
    defaultValues: {
      name: tag?.name,        // Set default value for name
      color: tag?.color || '#ffffff', // Set default color (fallback to white)
      isPublic : Boolean(tag?.isPublic),
    },
  });

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag?.name || "",
        color: tag?.color || "#ffffff",
        isPublic: Boolean(tag?.isPublic),
      });
    }
  }, [tag, form.reset]);

  async function onSubmit(values: z.infer<typeof updateTagInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Required fields are empty');
      return;
    }
    updateTagMutation.mutate({ data: values, tagId: tag?.id! });
  }

  if(tagQuery.isPending){
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!tag) {
    return null;
  }
  
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
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
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="mt-2 flex flex-row items-center space-x-3 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div>
                  <FormLabel>Make this tag public?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Public tags can be used for everyone (On public form).
                  </p>
                </div>
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
