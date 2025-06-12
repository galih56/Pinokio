import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import type { MutationConfig } from "@/lib/react-query"
import { api } from '@/lib/api-client';

export const submitFormResponseSchema = z.record(z.any())

export type SubmitFormResponseInput = z.infer<typeof submitFormResponseSchema>

export const submitFormResponse = async ({
  formId,
  data,
}: {
  formId: string
  data: SubmitFormResponseInput
}): Promise<{ id: string; submittedAt: string }> => {
    return api.post(`/forms/${formId}/responses`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
}

type UseSubmitFormResponseOptions = {
  formId: string
  mutationConfig?: MutationConfig<typeof submitFormResponse>
}

export const useSubmitFormResponse = ({ formId, mutationConfig }: UseSubmitFormResponseOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (res: { id: string; submittedAt: string }, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ["forms", formId, "responses"],
      })
      onSuccess?.(res, ...args)
    },
    ...restConfig,
    mutationFn: (data) => submitFormResponse({formId,data}),
  })
}
