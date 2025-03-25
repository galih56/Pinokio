import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

import { getIssueQueryOptions } from './get-issue';

export const updateIssueInputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  project: z.object({}).optional(), 
  assigneeId: z.string(),
  assigneeType: z.string(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  status: z.enum(['open', 'idle', 'in progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.date().optional(),
  tagIds: z.array(z.string().min(1))
    .min(1, 'At least one issue type is required')
    .refine(values => values.every(v => v !== ''), {
      message: 'Please select valid issue types',
    }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateIssueInput = z.infer<typeof updateIssueInputSchema>;

export const updateIssue = ({
  data,
  issueId,
}: {
  data: UpdateIssueInput;
  issueId: string;
}): Promise<Issue> => {
  return api.put(`/issues/${issueId}`, data);
};

type UseUpdateIssueOptions = {
  issueId: string;
  mutationConfig?: MutationConfig<typeof updateIssue>;
};

export const useUpdateIssue = ({
  issueId,
  mutationConfig,
}: UseUpdateIssueOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getIssueQueryOptions(issueId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateIssue,
  });
};
