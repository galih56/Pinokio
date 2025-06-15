import { useQuery, queryOptions } from "@tanstack/react-query"
import type { QueryConfig } from "@/lib/react-query"
import { api } from "@/lib/api-client"
import type { FormResponse } from "@/types/form"
import { Meta } from "@/types/api"

export const getFormResponses = async (
  formId: string,
  page?: number,
  perPage?: number,
  search?: string,
): Promise<{ data: FormResponse[]; meta?: Meta }> => {
  const params: Record<string, any> = { search }

  if (page && page > 0) {
    params.page = page
    params.per_page = perPage
  }

  return api.get(`/forms/${formId}/responses`, { params })
}

export const getFormResponsesQueryOptions = (
  formId: string,
  { page, perPage = 15, search = "" }: { page?: number; perPage?: number; search?: string } = {},
) => {
  const isPaginated = !!page && page > 0

  return queryOptions({
    queryKey: ["forms", formId, "responses", { paginated: isPaginated, page, perPage, search }],
    queryFn: () => getFormResponses(formId, page, perPage, search),
  })
}

type UseGetFormResponsesOptions = {
  formId: string
  page?: number
  perPage?: number
  search?: string
  queryConfig?: QueryConfig<typeof getFormResponses>
}

export const useGetFormResponses = ({
  formId,
  page,
  perPage = 15,
  search = "",
  queryConfig,
}: UseGetFormResponsesOptions) => {
  return useQuery({
    ...getFormResponsesQueryOptions(formId, { page, perPage, search }),
    ...queryConfig,
    select: (data) => ({
      data: data.data,
      meta: data.meta, // Will be undefined if unpaginated
    }),
  })
}
