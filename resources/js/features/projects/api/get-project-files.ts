import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { File } from '@/types/api';

export const getIssueFiles = ({
  issueId,
}: {
  issueId: string;
}): Promise<{ data: File[] }> => {
  return api.get(`/issues/${issueId}/files`);
};

export const getIssueFilesQueryOptions = (issueId: string) => {
  return queryOptions({
    queryKey: ['issue-files', issueId],
    queryFn: () => getIssueFiles({ issueId }),
  });
};

type UseIssueFilesOptions = {
  issueId: string;
  queryConfig?: QueryConfig<typeof getIssueFilesQueryOptions>;
};

export const useIssueFiles = ({
  issueId,
  queryConfig,
}: UseIssueFilesOptions) => {
  return useQuery({
    ...getIssueFilesQueryOptions(issueId),
    ...queryConfig,
  });
};
