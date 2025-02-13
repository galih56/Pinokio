import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

import { getIssueQueryOptions } from './get-issue';


export const updateIssueStatus = ({
  issueId,
  status
}: {
  issueId: string;
  status: string;
}): Promise<Issue> => {
  return api.put(`/issues/${issueId}/status`, { status : status });
};

type UseCloseIssueOptions = {
  issueId: string;
  mutationConfig?: MutationConfig<typeof updateIssueStatus>;
};

export const useUpdateIssueStatus = ({
  issueId,
  mutationConfig,
}: UseCloseIssueOptions) => {
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
    mutationFn: (inputs : any) => updateIssueStatus({
      issueId : inputs.issueId,
      status : inputs.status
    }),
  });
};
