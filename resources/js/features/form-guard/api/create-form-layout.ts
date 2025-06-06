import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import type { MutationConfig } from "@/lib/react-query"
import type { Form } from "@/types/api"
import { api } from "@/lib/api-client"

export const createFormLayoutSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      image: z.string().optional(),
      fields: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["text", "email", "tel", "number", "date", "url", "textarea", "select", "radio", "checkbox"]),
          label: z.string(),
          placeholder: z.string().optional(),
          required: z.boolean().default(false),
          options: z.array(z.string()).optional(),
          min: z.number().optional(),
          max: z.number().optional(),
          rows: z.number().optional(),
          image: z.string().optional(),
          defaultValue: z.string().optional(),
        }),
      ),
    }),
  ),
})

export type CreateFormLayoutInput = z.infer<typeof createFormLayoutSchema>

export const createFormLayout = async (formId : string, data: CreateFormLayoutInput): Promise<Form> => {
    return api.post(`/forms/${formId}/layout`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

type UseCreateFormLayoutOptions = {
  formId: string
  mutationConfig?: MutationConfig<typeof createFormLayout>
}

export const useCreateFormLayout = ({ formId, mutationConfig }: UseCreateFormLayoutOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (res: FormLayout, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ["forms", formId, "Layout"],
      })
      onSuccess?.(res, ...args)
    },
    ...restConfig,
    mutationFn: (data : any) => createFormLayout(formId, data),
  })
}
