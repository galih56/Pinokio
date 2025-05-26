import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Form } from '@/types/api';
import { subYears } from 'date-fns';

import { getFormsQueryOptions } from './get-forms';

export const createFormInputSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  provider: z.enum(["Pinokio", "Google Form"], { message: "Form provider is required." }),
  formCode: z.string().optional(),
  formUrl: z.string().url({ message: "Invalid URL." }).optional(),
  accessType: z.enum(["public", "token", "identifier"], { message: "Access type is required." }),
  identifierLabel: z.string().optional(),
  identifierDescription: z.string().optional(),
  identifierType: z.enum(["email", "number", "text"]).optional(),

  timeLimit: z.coerce.number().min(0, { message: "Time limit cannot be negative." }).optional(),
  allowMultipleAttempts: z.boolean().default(false),
  isActive: z.boolean().default(true),
  proctored: z.boolean().default(false),
})
.refine(data => {
  if (data.provider === "Google Form" && (!data.formCode || !data.formUrl)) {
    return false;
  }
  return true;
}, {
  message: "Google form must have both code and URL.",
  path: ["formCode"], // you could also put both formCode and form_url here
})
.refine(data => {
  if (data.accessType === "identifier" && (!data.identifierLabel || !data.identifierType)) {
    return false;
  }
  return true;
}, {
  message: "Identifier label and type are required when access type is 'identifier'.",
  path: ["identifierLabel"],
});
export type CreateFormInput = z.infer<typeof createFormInputSchema>;

export const createForm = (data : CreateFormInput): Promise<Form> => {
  return api.post(`/forms`, data, {
    headers : {
      "Content-Type" : 'multipart/form-data'
    }
  });
};

type UseCreateFormOptions = {
  mutationConfig?: MutationConfig<typeof createForm>;
};

export const useCreateForm = ({
  mutationConfig,
}: UseCreateFormOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getFormsQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createForm,
  });
};
