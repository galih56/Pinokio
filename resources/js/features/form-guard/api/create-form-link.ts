import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { MutationConfig } from "@/lib/react-query"
import { api } from "@/lib/api-client"
import { Form } from "@/types/form"

export type GetFormLinkInput = {
  formId: string;
  expiresAt : Date | null
}

export const getFormLink = async ({ formId, expiresAt }: GetFormLinkInput): Promise<Form> => {
  const response = await api.post(`/forms/${formId}/generate-link`, { expiresAt : expiresAt }) 
  return response.data
}

type UseGetFormLinkOptions = {
  mutationConfig?: MutationConfig<typeof getFormLink>
}

export const useGetFormLink = ({ mutationConfig }: UseGetFormLinkOptions = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    mutationFn: getFormLink,
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
