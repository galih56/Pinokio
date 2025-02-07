import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';
import { subYears } from 'date-fns';

import { getIssuesQueryOptions } from './get-issues';


export const createIssueInputSchema = z.object({
  projectId: z.string().optional(),
  reporterId: z.string().optional(),
  name: z.string({ message: "Please tell us your name." }).min(1, { message: "Please tell us your name." }),
  email: z.string({ message: "Please tell us your email." }).min(1, { message: "Please tell us your email." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  files: z.array(z.instanceof(File)).optional(), 
  tagId: z.string().min(1, 'Issue type is required').refine(value => value !== '', {
    message: 'Please select a issue type',
  }),
});
export type CreateIssueInput = z.infer<typeof createIssueInputSchema>;

export const createIssue = (data : CreateIssueInput): Promise<Issue> => {
  return api.post(`/issues`, data, {
    headers : {
      "Content-Type" : 'multipart/form-data'
    }
  });
};

type UseCreateIssueOptions = {
  mutationConfig?: MutationConfig<typeof createIssue>;
};

export const useCreateIssue = ({
  mutationConfig,
}: UseCreateIssueOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getIssuesQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createIssue,
  });
};
