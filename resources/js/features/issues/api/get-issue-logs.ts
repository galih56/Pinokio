import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { IssueLog, Meta } from '@/types/api';

export const getIssueLogs = (
  issueId: string,
  page = 1,
  perPage = 15,
  search?: string
): Promise<{
  data: IssueLog[];
  meta?: Meta;
}> => {
  return api.get(`/issues/${issueId}/logs`, {
    params: {
      page,
      per_page: perPage,
      search,
    },
  });
};

export const getIssueLogsQueryOptions = ({
  issueId,
  page,
  perPage = 15,
  search,
}: { issueId: string; page?: number; perPage?: number; search?: string }) => {
  return queryOptions({
    queryKey: ['issue-logs', { issueId, page, perPage, search }],
    queryFn: () => getIssueLogs(issueId, page, perPage, search),
  });
};

type UseIssueLogsOptions = {
  issueId: string;
  page?: number;
  perPage?: number;
  search?: string;
  queryConfig?: QueryConfig<typeof getIssueLogsQueryOptions>;
};

export const useIssueLogs = ({
  issueId,
  queryConfig,
  page = 1,
  perPage = 15,
  search,
}: UseIssueLogsOptions) => {
  return useQuery({
    ...getIssueLogsQueryOptions({ issueId, page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta,
    }),
  });
};
