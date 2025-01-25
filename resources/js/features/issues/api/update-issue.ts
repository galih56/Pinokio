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
  reporterId: z.string().optional(),
  reporter: z.object({}).optional(),
  guestIssuerId: z.string().optional(),
  guestIssuer: z.object({}).optional(),
  assigneeId: z.string(),
  assigneeType: z.string(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  status: z.enum(['open', 'idle', 'in progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.date().optional(),
  comments: z.array(z.object({})).optional(),
  tags: z.array(z.object({})).optional(),
  history: z.array(z.object({})).optional(),
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
  return api.patch(`/issues/${issueId}`, data);
};

type UseUpdateIssueOptions = {
  mutationConfig?: MutationConfig<typeof updateIssue>;
};

export const useUpdateIssue = ({
  mutationConfig,
}: UseUpdateIssueOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getIssueQueryOptions(data.id).queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateIssue,
  });
};
