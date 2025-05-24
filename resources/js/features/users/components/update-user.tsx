import { Loader2 } from 'lucide-react';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { Authorization, ROLES } from '@/lib/authorization';
import { useUser } from '../api/get-user';
import {
  updateUserInputSchema,
  useUpdateUser,
} from '../api/update-user';
import { useIsFetching, useQueries } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import { getUserRoles } from '../api/get-user-roles';

type UpdateUserProps = {
  userId: string | undefined;
};

export const UpdateUser = ({ userId }: UpdateUserProps) => {
  const { addNotification } = useNotifications();

  if(!userId){
    return null
  }

  const userQuery = useUser({ userId });
  const updateUserMutation = useUpdateUser({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'User Updated',
          toast: true
        });
      },
    },
  });
  const user = userQuery.data?.data;

  if(!user || userQuery.isPending){
    return null
  }

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof updateUserInputSchema>>({
    resolver: zodResolver(updateUserInputSchema),
    defaultValues : {
      username : user?.username,
      email : user?.email,
      roleCode : user?.role?.code
    }
  })

  async function onSubmit(values: z.infer<typeof updateUserInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true
      });
      return;
    }
    updateUserMutation.mutate({ data : values, userId : user?.id!})
  }
  
  const queries = useQueries({
    queries : [
      { queryKey: ['user-roles'], queryFn: getUserRoles },
    ]
  })

  const [
    userRolesQuery,
  ] = queries;
  
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="roleCode"
            render={({ field , formState : { errors }  }) => (
              <FormItem className="my-2">
                <FormLabel>Role</FormLabel>
                <FormControl>
                  {userRolesQuery.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRolesQuery.data?.data?.map((item) => {
                          return (
                          <SelectItem key={item.code} value={item.code}>
                            {item.name}
                          </SelectItem>
                        )})}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                {errors.roleCode && <FormMessage> {errors.roleCode.message} </FormMessage>}
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="email"
            render={({ field , formState : { errors }  }) => (    
              <FormItem className='my-3'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                      <Input {...field} placeholder="Email" type="email"/>
                  </FormControl>
                  <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className='my-3'>
                <FormLabel className='leading-7'>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password" {...field} type='password' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem className='my-3'>
                <FormLabel className='leading-7'>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password Confirmation" {...field}  type='password' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="my-4">
            <Button type="submit" disabled={Boolean(isFetching) }>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};
