import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Tag } from '@/types/api';

export const getTag = ({
  tagId,
}: {
  tagId: string;
}): Promise<{ data: Tag }> => {
  return api.get(`/tags/${tagId}`);
};

export const getTagQueryOptions = (tagId: string) => {
  return queryOptions({
    queryKey: ['tags', tagId],
    queryFn: () => getTag({ tagId }),
  });
};

type UseTagOptions = {
  tagId: string;
  queryConfig?: QueryConfig<typeof getTagQueryOptions>;
};

export const useTag = ({
  tagId,
  queryConfig,
}: UseTagOptions) => {
  return useQuery({
    ...getTagQueryOptions(tagId),
    ...queryConfig,
  });
};
