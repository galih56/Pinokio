import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

export const getIssue = ({
  issueId,
}: {
  issueId: string;
}): Promise<{ data: Issue }> => {
  return api.get(`/issues/${issueId}`);
};

export const getIssueQueryOptions = (issueId: string) => {
  return queryOptions({
    queryKey: ['issues', issueId],
    queryFn: () => getIssue({ issueId }),
  });
};

type UseIssueOptions = {
  issueId: string;
  queryConfig?: QueryConfig<typeof getIssueQueryOptions>;
};

export const useIssue = ({
  issueId,
  queryConfig,
}: UseIssueOptions) => {
  return useQuery({
    ...getIssueQueryOptions(issueId),
    ...queryConfig,
  });
};
