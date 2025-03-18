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
import { useUserRole } from '../api/get-user-role';
import {
  updateUserRoleInputSchema,
  useUpdateUserRole,
} from '../api/update-user-role';
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

type UpdateUserRoleProps = {
  userRoleId: string;
  onSuccess? : ( ) => void;
  onError? : ( ) => void;
};

export const UpdateUserRole = ({ userRoleId , onSuccess, onError}: UpdateUserRoleProps) => {
  const { addNotification } = useNotifications();

  const userRoleQuery = useUserRole({ userRoleId });
  const updateUserRoleMutation = useUpdateUserRole({
    userRoleId : userRoleId,
    config: {
      onSuccess: onSuccess,
      onError: onError,
    },
  });

  const userRole = userRoleQuery.data?.data;

  const form = useForm<z.infer<typeof updateUserRoleInputSchema>>({
    resolver: zodResolver(updateUserRoleInputSchema),
    defaultValues: {
      name: userRole?.name,    
      color: userRole?.color || '#ffffff', 
    },
  });

  useEffect(() => {
    if (userRole) {
      form.reset({
        name: userRole?.name || "",
        color: userRole?.color || "#ffffff",
      });
    }
  }, [userRole, form.reset]);

  async function onSubmit(values: z.infer<typeof updateUserRoleInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true
      });
      return;
    }
    updateUserRoleMutation.mutate({ data: values, userRoleId: userRole?.id! });
  }

  if(userRoleQuery.isPending){
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!userRole) {
    return null;
  }
  
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <div>
            <p>
              <b>Code : </b>
              <span> {userRole.code} </span>
            </p>
          </div>
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
            <Button type="submit" isLoading={updateUserRoleMutation.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};
