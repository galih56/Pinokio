import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Issue, Meta } from '@/types/api';

type Issuer = {
  name : string;
  email : string;
}

export const getPublicIssues = (
  page = 1,
  perPage = 15,
  search?: string,
  issuer? : Issuer
): Promise<{
  data: Issue[];
  meta?: Meta;
}> => {
  return api.get(`/public-issues`, {
    params: {
      page,
      per_page: perPage,
      search,
      ...issuer
    },
  });
};

export const getPublicIssuesQueryOptions = ({
  page,
  perPage = 15,
  search, 
  issuer,
}: { page?: number; perPage?: number; search?: string, issuer : Issuer }) => {
  return queryOptions({
    queryKey: ['public-issues', { page, perPage, search }],
    queryFn: () => getPublicIssues(page, perPage, search, issuer),
  });
};

type UsePublicIssuesOptions = {
  page?: number;
  perPage?: number;
  search?: string; 
  issuer : Issuer;
  queryConfig?: QueryConfig<typeof getPublicIssuesQueryOptions>;
};

export const usePublicIssues = ({
  queryConfig,
  page = 1,
  perPage = 15,
  search, 
  issuer
}: UsePublicIssuesOptions) => {
  return useQuery({
    ...getPublicIssuesQueryOptions({ page, perPage, search, issuer }), 
    ...queryConfig,
    select: (data) => {
      return {
        data: data.data,
        meta: data.meta,
      };
    },
  });
};
