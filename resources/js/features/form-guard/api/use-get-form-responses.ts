import { useQuery, queryOptions } from "@tanstack/react-query"
import type { QueryConfig } from "@/lib/react-query"
import { api } from '@/lib/api-client';
import { FormResponse } from "@/types/form";

export const getFormResponses = async (formId: string): Promise<FormResponse[]> => {
    return api.get(`/forms/${formId}/responses`)
}

export const getFormResponsesQueryOptions = (formId: string) => {
  return queryOptions({
    queryKey: ["forms", formId, "responses"],
    queryFn: () => getFormResponses(formId),
  })
}

type UseGetFormResponsesOptions = {
  formId: string
  queryConfig?: QueryConfig<typeof getFormResponses>
}

export const useGetFormResponses = ({ formId, queryConfig }: UseGetFormResponsesOptions) => {
  return useQuery({
    ...getFormResponsesQueryOptions(formId),
    ...queryConfig,
  })
}
