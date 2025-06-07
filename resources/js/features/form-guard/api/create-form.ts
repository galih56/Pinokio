import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { decamelizeKeys } from "humps"

import { api } from "@/lib/api-client"
import type { MutationConfig } from "@/lib/react-query"
import { Form } from "@/types/form"

export const createFormInputSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z.string().optional(),
    provider: z.enum(["Pinokio", "Google Form"], { message: "Form provider is required." }),
    formCode: z.string().optional(),
    formUrl: z.string().url({ message: "Invalid URL." }).optional(),
    identifierLabel: z.string().optional(),
    identifierDescription: z.string().optional(),
    identifierType: z.enum(["email", "number", "text"]).optional(),
    expiresAt: z.date().optional().nullable(),
    timeLimit: z.coerce.number().min(0, { message: "Time limit cannot be negative." }).optional(),
    allowMultipleAttempts: z.boolean().default(false),
    isActive: z.boolean().default(true),
    proctored: z.boolean().default(false),
    requiresToken: z.boolean().default(false),
    requiresIdentifier: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.provider === "Google Form" && (!data.formCode || !data.formUrl)) {
        return false;
      }
      return true;
    },
    {
      message: "Google Form must have both a form code and URL.",
      path: ["formCode"],
    },
  )
  .refine(
    (data) => {
      if (data.requiresIdentifier && (!data.identifierLabel || !data.identifierType)) {
        return false;
      }
      return true;
    },
    {
      message: "Identifier label and type are required when identifier access is enabled.",
      path: ["identifierLabel"],
    },
  );
  
export type CreateFormInput = z.infer<typeof createFormInputSchema>

export const createForm = (data: CreateFormInput): Promise<Form> => {
  return api.post(`/forms`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

type UseCreateFormOptions = {
  mutationConfig?: MutationConfig<typeof createForm>
}

export const useCreateForm = ({ mutationConfig }: UseCreateFormOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args: any) => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'forms',
        refetchType: 'active', // only refetch if used
      });
      onSuccess?.(args)
    },
    ...restConfig,
    mutationFn: createForm,
  })
}