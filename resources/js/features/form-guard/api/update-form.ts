import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Form } from '@/types/api';

import { getFormQueryOptions } from './get-form';

export const updateFormSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Title is required." }),
  type: z.enum(['internal', 'google']),
  formCode: z.string().optional(),
  formUrl: z.string().optional(),
  accessType: z.enum(['public', 'token', 'identifier']),
  identifierLabel: z.string().optional(),
  identifierDescription: z.string().optional(),
  identifierType: z.string().optional(),
  timeLimitMinutes: z.number().int().nonnegative(),
  allowMultipleAttempts: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(), // assuming ISO date strings
  updatedAt: z.date(),
});

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
