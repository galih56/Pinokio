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
import { Authorization, ROLES } from '@/lib/authorization';
import { DatePicker } from '@/components/ui/date-picker/date-picker';

import { useTask } from '../api/get-task';
import {
  updateTaskInputSchema,
  useUpdateTask,
} from '../api/update-task';
import { useIsFetching, useQueries } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

type UpdateTaskProps = {
  taskId: string | undefined;
};

export const UpdateTask = ({ taskId }: UpdateTaskProps) => {
  if(!taskId){
    return null
  }

  const taskQuery = useTask({ taskId });
  const updateTaskMutation = useUpdateTask({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Task Updated');
      },
    },
  });
  const task = taskQuery.data?.data;

  if(!task || taskQuery.isPending){
    return null
  }

  const isFetching = useIsFetching();
  const form = useForm<z.infer<typeof updateTaskInputSchema>>({
    resolver: zodResolver(updateTaskInputSchema),
    defaultValues : {
      code : task?.code,
      name : task?.name,
    }
  })

  async function onSubmit(values: z.infer<typeof updateTaskInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Required fields are empty');
      return;
    }
    updateTaskMutation.mutate({ data : values, taskId : task?.id!})
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
