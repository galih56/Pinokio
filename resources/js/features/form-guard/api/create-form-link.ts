import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { MutationConfig } from "@/lib/react-query"
import { api } from "@/lib/api-client"
import type { Form } from "@/types/api"
import { getFormsQueryOptions } from "./get-forms"

export type GenerateFormLinkInput = {
  formId: string
}

export const generateFormLink = async ({ formId }: GenerateFormLinkInput): Promise<Form> => {
  const response = await api.post(`/forms/${formId}/generate-link`)
  return response.data
}

type UseGenerateFormLinkOptions = {
  mutationConfig?: MutationConfig<typeof generateFormLink>
}

export const useGenerateFormLink = ({ mutationConfig }: UseGenerateFormLinkOptions = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    mutationFn: generateFormLink,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'forms',
        refetchType: 'active',
      })
      onSuccess?.(data, variables, context)
    },
    ...restConfig,
  })
}
