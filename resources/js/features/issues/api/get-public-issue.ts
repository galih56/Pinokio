import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

export const getPublicIssue = ({
  issueId,
}: {
  issueId: string;
}): Promise<{ data: Issue }> => {
  return api.get(`/public-issues/${issueId}`);
};

export const getPublicIssueQueryOptions = (issueId: string) => {
  return queryOptions({
    queryKey: ['public-issues', issueId],
    queryFn: () => getPublicIssue({ issueId }),
  });
};

type UsePublicIssueOptions = {
  issueId: string;
  queryConfig?: QueryConfig<typeof getPublicIssueQueryOptions>;
};

export const usePublicIssue = ({
  issueId,
  queryConfig,
}: UsePublicIssueOptions) => {
  return useQuery({
    ...getPublicIssueQueryOptions(issueId),
    ...queryConfig,
  });
};
