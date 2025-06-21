import { useQuery, queryOptions } from "@tanstack/react-query"
import type { QueryConfig } from "@/lib/react-query"
import { api } from "@/lib/api-client"
import { Form } from "@/types/form"

export const getPublicFormLayout = async (formId: string): Promise<Form> => {
  return api.get(`/form-guard/${formId}`)
}

export const getPublicFormLayoutQueryOptions = (formId: string) => {
  return queryOptions({
    queryKey: ["form-guard", formId],
    queryFn: () => getPublicFormLayout(formId),
  })
}

type UseGetPublicFormLayoutOptions = {
  formId: string
  queryConfig?: QueryConfig<typeof getPublicFormLayout>
}

export const useGetPublicFormLayout = ({ formId, queryConfig }: UseGetPublicFormLayoutOptions) => {
  return useQuery({
    ...getPublicFormLayoutQueryOptions(formId),
    ...queryConfig,
  })
}
