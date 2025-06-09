import { useQuery, queryOptions } from "@tanstack/react-query"
import type { QueryConfig } from "@/lib/react-query"
import { api } from "@/lib/api-client"
import { Form } from "@/types/form"

export const getFormLayout = async (formId: string): Promise<Form> => {
  return api.get(`/forms/${formId}/layout`)
}

export const getFormLayoutQueryOptions = (formId: string) => {
  return queryOptions({
    queryKey: ["forms", formId, "layout"],
    queryFn: () => getFormLayout(formId),
  })
}

type UseGetFormLayoutOptions = {
  formId: string
  queryConfig?: QueryConfig<typeof getFormLayout>
}

export const useGetFormLayout = ({ formId, queryConfig }: UseGetFormLayoutOptions) => {
  return useQuery({
    ...getFormLayoutQueryOptions(formId),
    ...queryConfig,
  })
}
