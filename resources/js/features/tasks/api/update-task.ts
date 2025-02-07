import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Task } from '@/types/api';

import { getTaskQueryOptions } from './get-task';

export const updateTaskInputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  project: z.object({}).optional(), 
  assigneeId: z.string(),
  assigneeType: z.string(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  status: z.enum(['open', 'idle', 'in progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.date().optional(),
  tags: z.array(z.object({})).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const updateTask = ({
  data,
  taskId,
}: {
  data: UpdateTaskInput;
  taskId: string;
}): Promise<Task> => {
  return api.patch(`/tasks/${taskId}`, data);
};

type UseUpdateTaskOptions = {
  taskId: string;
  mutationConfig?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({
  taskId,
  mutationConfig,
}: UseUpdateTaskOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getTaskQueryOptions(taskId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateTask,
  });
};
