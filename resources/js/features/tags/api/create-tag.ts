import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Tag } from '@/types/api';
import { subYears } from 'date-fns';

import { getTagsQueryOptions } from './get-tags';

export type CreateTagDTO = Omit<Tag, "id" | "issues" | "createdAt">;

export const createTagInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const createTag = (data : CreateTagInput): Promise<Tag> => {
  return api.post(`/tags`, data);
};

type UseCreateTagOptions = {
  mutationConfig?: MutationConfig<typeof createTag>;
};

export const useCreateTag = ({
  mutationConfig,
}: UseCreateTagOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getTagsQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createTag,
  });
};
