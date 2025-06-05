import { useQuery, queryOptions } from "@tanstack/react-query"
import type { QueryConfig } from "@/lib/react-query"
import type { FormTemplate } from "@/types/api"
import { api } from "@/lib/api-client"

export const getFormTemplate = async (formId: string): Promise<FormTemplate> => {
  return api.get(`/forms/${formId}/template`)
}

export const getFormTemplateQueryOptions = (formId: string) => {
  return queryOptions({
    queryKey: ["forms", formId, "template"],
    queryFn: () => getFormTemplate(formId),
  })
}

type UseGetFormTemplateOptions = {
  formId: string
  queryConfig?: QueryConfig<typeof getFormTemplate>
}

export const useGetFormTemplate = ({ formId, queryConfig }: UseGetFormTemplateOptions) => {
  return useQuery({
    ...getFormTemplateQueryOptions(formId),
    ...queryConfig,
  })
}
