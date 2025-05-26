import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Form } from '@/types/api';

export const getForm = ({
  formId,
}: {
  formId: string;
}): Promise<{ data: Form }> => {
  const res = api.get(`/forms/${formId}`);
  return res;
};

export const getFormQueryOptions = (formId: string) => {
  return queryOptions({
    queryKey: ['forms', formId],
    queryFn: () => getForm({ formId }),
  });
};

type UseFormOptions = {
  formId: string;
  queryConfig?: QueryConfig<typeof getFormQueryOptions>;
};

export const useFormDetail = ({
  formId,
  queryConfig,
}: UseFormOptions) => {
  return useQuery({
    ...getFormQueryOptions(formId),
    ...queryConfig,
  });
};
