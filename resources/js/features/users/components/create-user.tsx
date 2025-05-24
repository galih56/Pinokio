import { Button } from "@/components/ui/button"
import {
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserInputSchema, useCreateUser } from '../api/create-user';
import { useNotifications } from '@/components/ui/notifications';
import { useIsFetching, useQueries } from '@tanstack/react-query';
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { getUserRoles } from "../api/get-user-roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  
type CreateUserType = {
  onSuccess? : Function;
  onError? : Function;
}

export default function CreateUser({
  onSuccess,
  onError
} : CreateUserType) { 
  const { addNotification } = useNotifications();
  const createUserMutation = useCreateUser({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: () => {
        onError?.();
      },
    },
  });
  
  const queries = useQueries({
    queries : [
      { queryKey: ['user-roles'], queryFn: getUserRoles },
    ]
  })
  const [
    userRolesQuery,
  ] = queries;

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof createUserInputSchema>>({
    resolver: zodResolver(createUserInputSchema),
    defaultValues : {
      roleCode : 'MEMBER'
    }
  })
  
  async function onSubmit(values: z.infer<typeof createUserInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true
      });
      return;
    }
    createUserMutation.mutate(values)
  }

  return (  
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
            name="username"
            render={({ field , formState : { errors }  }) => (    
              <FormItem className='my-3'>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                      <Input {...field} placeholder="Username" type="text"/>
                  </FormControl>
                  <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name"
            render={({ field , formState : { errors }  }) => (    
              <FormItem className='my-3'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                      <Input {...field} placeholder="Name" type="text"/>
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
  )
}
