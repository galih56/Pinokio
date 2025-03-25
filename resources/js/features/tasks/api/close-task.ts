import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Task } from '@/types/api';
import { getTaskQueryOptions } from './get-task';

export const closeTask = async (taskId: string): Promise<Task> => {
  return api.put(`/tasks/${taskId}/close`, { status: 'closed' });
};

type UseCloseTaskOptions = {
  taskId: string;
  mutationConfig?: MutationConfig<typeof closeTask>;
};

export const useCloseTask = ({ taskId, mutationConfig }: UseCloseTaskOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: () => closeTask(taskId),
    onSuccess: (res: Task, ...args) => {
      queryClient.refetchQueries({
        queryKey: getTaskQueryOptions(taskId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
  });
};
