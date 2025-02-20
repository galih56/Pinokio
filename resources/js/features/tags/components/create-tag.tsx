import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTagInputSchema, useCreateTag } from "../api/create-tag";
import { useNotifications } from "@/components/ui/notifications";
import { useIsFetching } from "@tanstack/react-query";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { Checkbox } from "@/components/ui/checkbox";

type CreateTagType = {
  onSuccess?: Function;
  onError?: Function;
};

export default function CreateTag({ onSuccess, onError }: CreateTagType) {
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
      color: "#ffffff",
      isPublic: false, // Default to false
    },
  });

  async function onSubmit(values: z.infer<typeof createTagInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: "error",
        title: "Required fields are empty",
        toast: true,
      });
      return;
    }
    createTagMutation.mutate(values);
  }

  return (
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
            <FormItem className="mt-4 flex items-center space-x-4">
              <FormLabel>Choose a Tag Color:</FormLabel>
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

        {/* Public Tag Checkbox */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 rounded-md border p-4">
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
          <Button type="submit" disabled={Boolean(isFetching)}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
