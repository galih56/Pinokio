import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Issue } from '@/types/api';

import { getPublicIssueQueryOptions } from './get-public-issue';


export const closePublicIssue = ({
  issueId,
  issuer
}: {
  issueId: string;
  issuer : {
    name : string;
    email : string;
  }
}): Promise<Issue> => {
  return api.put(`/public-issues/${issueId}/close`, { status : 'closed', ...issuer });
};

type UseClosePublicIssueOptions = {
  issueId : string;
  mutationConfig?: MutationConfig<typeof closePublicIssue>;
};

export const useClosePublicIssue = ({
  issueId,
  mutationConfig,
}: UseClosePublicIssueOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getPublicIssueQueryOptions(issueId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: (data) => closePublicIssue(data),
  });
};
