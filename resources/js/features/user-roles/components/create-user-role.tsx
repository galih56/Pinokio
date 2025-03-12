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
import { createUserRoleInputSchema, useCreateUserRole } from "../api/create-user-role";
import { useNotifications } from "@/components/ui/notifications";
import { useIsFetching } from "@tanstack/react-query";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { Checkbox } from "@/components/ui/checkbox";

type CreateUserRoleType = {
  onSuccess?: Function;
  onError?: Function;
};

export default function CreateUserRole({ onSuccess, onError }: CreateUserRoleType) {
  const { addNotification } = useNotifications();
  const createUserRoleMutation = useCreateUserRole({
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
  const form = useForm<z.infer<typeof createUserRoleInputSchema>>({
    resolver: zodResolver(createUserRoleInputSchema),
    defaultValues: {
      color: "#ffffff",
      isPublic: false, // Default to false
    },
  });

  async function onSubmit(values: z.infer<typeof createUserRoleInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: "error",
        title: "Required fields are empty",
        toast: true,
      });
      return;
    }
    createUserRoleMutation.mutate(values);
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
              <FormLabel>Choose a UserRole Color:</FormLabel>
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
          <Button type="submit"  isLoading={createUserRoleMutation.isPending} disabled={Boolean(isFetching)}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
