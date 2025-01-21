import { Loader2, Pen } from 'lucide-react';

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
import { DatePicker } from '@/components/ui/date-picker/date-picker';

import { useIssue } from '../api/get-issue';
import {
  updateIssueInputSchema,
  useUpdateIssue,
} from '../api/update-issue';
import { useIsFetching, useQueries } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';

type UpdateIssueProps = {
  issueId: string | undefined;
};

export const UpdateIssue = ({ issueId }: UpdateIssueProps) => {
  const { addNotification } = useNotifications();

  if(!issueId){
    return null
  }

  const issueQuery = useIssue({ issueId });
  const updateIssueMutation = useUpdateIssue({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Issue Updated',
        });
      },
    },
  });
  const issue = issueQuery.data?.data;

  if(!issue || issueQuery.isPending){
    return null
  }

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof updateIssueInputSchema>>({
    resolver: zodResolver(updateIssueInputSchema),
    defaultValues : {
      code : issue?.code,
      name : issue?.name,
    }
  })

  async function onSubmit(values: z.infer<typeof updateIssueInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
      });;
      return;
    }
    updateIssueMutation.mutate({ data : values, issueId : issue?.id!})
  }

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field , formState : { errors }  }) => (    
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
            <Button type="submit" disabled={Boolean(isFetching) }>Submit</Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};
