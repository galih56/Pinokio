import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { paths } from '@/apps/authentication/paths';
import { useLogin, loginInputSchema } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';
import { AlertType } from '@/types/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import logo from '@/assets/logo-with-label.png';

type LoginFormProps = {
  onSuccess?: () => void;
  onError?: () => void;
};
 
export const LoginForm = ({ onSuccess , onError}: LoginFormProps) => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [ alert, setAlert ] = useState<AlertType | null>(null)

  const form = useForm<z.infer<typeof loginInputSchema>>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: ""
    },
  })
   
  const login = useLogin({
    onError : (error) => {
      let { status, message, data } = error.response.data;

      if (status === "error" && message === "Kesalahan input") {
        message = "Input error";
      }

      if (status === "error" && message === "Input error") {
        Object.entries(data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              form.setError(field as keyof LoginInput, {
                type: "manual",
                message: msg,
              });
            });
          }
        });
      }
      onError?.()
      if(error?.response?.data?.message){
        setAlert({
          title : 'Failed to login',
          message : 'Please check your email or your password',
          variant : 'destructive'
        })
      }
    },
    onSuccess(data, variables, context) {
      setAlert(null)
    },
  });
  function onSubmit(values: z.infer<typeof loginInputSchema>) {
    login.mutate(values)
  }

  return (
    <div> 
      <div className="flex justify-center">
        <Link className="flex items-center text-white" to={'/'} >
          <img className="h-56 w-auto" src={logo} alt="Pinokio" />
        </Link>
      </div>
      <Form {...form}>
        {alert && 
          <Alert variant={alert.variant}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-4">
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Password" {...field} type='password' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='w-full' type="submit" isLoading={login.isPending}>Sign In</Button>
        </form>
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <Link
            to={paths.auth.register.getHref(redirectTo)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};
