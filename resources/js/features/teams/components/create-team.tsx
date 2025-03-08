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
import { createTeamInputSchema, useCreateTeam } from "../api/create-team";
import { useNotifications } from "@/components/ui/notifications";
import { useIsFetching } from "@tanstack/react-query";
import { ColorPickerPopover } from "@/components/ui/color-picker-popover";
import { Checkbox } from "@/components/ui/checkbox";

type CreateTeamType = {
  onSuccess?: Function;
  onError?: Function;
};

export default function CreateTeam({ onSuccess, onError }: CreateTeamType) {
  const { addNotification } = useNotifications();
  const createTeamMutation = useCreateTeam({
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
  const form = useForm<z.infer<typeof createTeamInputSchema>>({
    resolver: zodResolver(createTeamInputSchema),
    defaultValues: {
      color: "#ffffff",
      isPublic: false, // Default to false
    },
  });

  async function onSubmit(values: z.infer<typeof createTeamInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: "error",
        title: "Required fields are empty",
        toast: true,
      });
      return;
    }
    createTeamMutation.mutate(values);
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

        <DialogFooter className="my-4">
          <Button type="submit" disabled={Boolean(isFetching)}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
