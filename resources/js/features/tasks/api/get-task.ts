import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Task } from '@/types/api';

export const getTask = ({
  taskId,
}: {
  taskId: string;
}): Promise<{ data: Task }> => {
  return api.get(`/tasks/${taskId}`);
};

export const getTaskQueryOptions = (taskId: string) => {
  return queryOptions({
    queryKey: ['tasks', taskId],
    queryFn: () => getTask({ taskId }),
  });
};

type UseTaskOptions = {
  taskId: string;
  queryConfig?: QueryConfig<typeof getTaskQueryOptions>;
};

export const useTask = ({
  taskId,
  queryConfig,
}: UseTaskOptions) => {
  return useQuery({
    ...getTaskQueryOptions(taskId),
    ...queryConfig,
  });
};
