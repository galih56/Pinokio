import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

import { getIssueQueryOptions } from './get-issue';


export const closeIssue = ({
  issueId,
}: {
  issueId: string;
}): Promise<Issue> => {
  return api.put(`/issues/${issueId}/close`, { status : 'closed' });
};

type UseCloseIssueOptions = {
  issueId: string;
  mutationConfig?: MutationConfig<typeof closeIssue>;
};

export const useCloseIssue = ({
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
    mutationFn: closeIssue,
  });
};
