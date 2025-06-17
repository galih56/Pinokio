import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Form } from '@/types/api';

import { getFormQueryOptions } from './get-form';


export const updateFormSchema = z
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

export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export const updateForm = ({
  data,
  formId,
}: {
  data: UpdateFormInput;
  formId: string;
}): Promise<Form> => {
  return api.put(`/forms/${formId}`, data);
};

type UseUpdateFormOptions = {
  formId: string;
  mutationConfig?: MutationConfig<typeof updateForm>;
};

export const useUpdateForm = ({
  formId,
  mutationConfig,
}: UseUpdateFormOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getFormQueryOptions(formId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateForm,
  });
};
