import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { File } from '@/types/api';

export const getTaskFiles = ({
  taskId,
}: {
  taskId: string;
}): Promise<{ data: File[] }> => {
  return api.get(`/tasks/${taskId}/files`);
};

export const getTaskFilesQueryOptions = (taskId: string) => {
  return queryOptions({
    queryKey: ['task-files', taskId],
    queryFn: () => getTaskFiles({ taskId }),
  });
};

type UseTaskFilesOptions = {
  taskId: string;
  queryConfig?: QueryConfig<typeof getTaskFilesQueryOptions>;
};

export const useTaskFiles = ({
  taskId,
  queryConfig,
}: UseTaskFilesOptions) => {
  return useQuery({
    ...getTaskFilesQueryOptions(taskId),
    ...queryConfig,
  });
};
