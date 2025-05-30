import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Task } from '@/types/api';
import { subYears } from 'date-fns';

import { getTasksQueryOptions } from './get-tasks';



export const createTaskInputSchema = z.object({
  name: z.string({ message: "Please tell us your name." }).min(1, { message: "Please tell us your name." }),
  email: z.string({ message: "Please tell us your email." }).min(1, { message: "Please tell us your email." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  files: z.array(z.instanceof(File)).optional(), 
  tagIds: z.array(z.string().min(1))
    .min(1, 'At least one issue type is required')
    .refine(values => values.every(v => v !== ''), {
      message: 'Please select valid issue types',
    })
});
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const createTask = (data : CreateTaskInput): Promise<Task> => {
  return api.post(`/tasks`, data, {
    headers : {
      "Content-Type" : 'multipart/form-data'
    }
  });
};

type UseCreateTaskOptions = {
  mutationConfig?: MutationConfig<typeof createTask>;
};

export const useCreateTask = ({
  mutationConfig,
}: UseCreateTaskOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createTask,
  });
};
