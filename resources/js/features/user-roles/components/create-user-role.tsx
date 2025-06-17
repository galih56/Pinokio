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
import { useIsFetching } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { useSearchUserRoles } from "../api/search-user-roles";
import { toast } from "sonner";

type CreateUserRoleType = {
  onSuccess?: Function;
  onError?: Function;
};

export default function CreateUserRole({ onSuccess, onError }: CreateUserRoleType) {
  const { data: userRoleCheck } = useSearchUserRoles({ search: "" });
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

  const extendedCreateUserRoleInputSchema = createUserRoleInputSchema.extend({
    code: z.string().refine(async (code) => {
        const existingRoles = userRoleCheck?.data ?? [];
        return !existingRoles.some((role) => role.code === code);
      }, "Role code already exists"),
  })

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof extendedCreateUserRoleInputSchema>>({
    resolver: zodResolver(extendedCreateUserRoleInputSchema),
  });

  async function onSubmit(values: z.infer<typeof extendedCreateUserRoleInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Required fields are empty");
      return;
    }
    createUserRoleMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Code" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
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
