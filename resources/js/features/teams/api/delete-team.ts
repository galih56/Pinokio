import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getTeamsQueryOptions } from './get-teams';


export type DeleteTeamDTO = {
  teamId: string;
};

export const deleteTeam = ({
  teamId,
}: DeleteTeamDTO) => {
  return api.delete(`/teams/${teamId}`);
};

type UseDeleteEmpoyeeOptions = {
  mutationConfig?: MutationConfig<typeof deleteTeam>;
};

export const useDeleteEmpoyee = ({
  mutationConfig,
}: UseDeleteEmpoyeeOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getTeamsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteTeam,
  });
};
