import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import {eTask } from '@/types/api';

import { geeTaskQueryOptions } from './get-task';


export const closeTask = ({
  taskId,
}: {
  taskId: string;
}): PromiseeTask> => {
  return api.put(`/tasks/${taskId}/close`, { status : 'closed' });
};

type UseCloseTaskOptions = {
  taskId: string;
  mutationConfig?: MutationConfig<typeof closeTask>;
};

export const useCloseTask = ({
  taskId,
  mutationConfig,
}: UseCloseTaskOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: geeTaskQueryOptions(taskId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: closeTask,
  });
};
