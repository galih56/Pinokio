import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { File } from '@/types/api';

export const getPublicIssueFiles = ({
  issueId,
}: {
  issueId: string;
}): Promise<{ data: File[] }> => {
  return api.get(`/public-issue-files/${issueId}/files`);
};

export const getPublicIssueFilesQueryOptions = (issueId: string) => {
  return queryOptions({
    queryKey: ['issue-files', issueId],
    queryFn: () => getPublicIssueFiles({ issueId }),
  });
};

type UsePublicIssueFilesOptions = {
  issueId: string;
  queryConfig?: QueryConfig<typeof getPublicIssueFilesQueryOptions>;
};

export const usePublicIssueFiles = ({
  issueId,
  queryConfig,
}: UsePublicIssueFilesOptions) => {
  return useQuery({
    ...getPublicIssueFilesQueryOptions(issueId),
    ...queryConfig,
  });
};
