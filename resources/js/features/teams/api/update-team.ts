import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Team } from '@/types/api';

import { getTeamQueryOptions } from './get-team';
import { getTeamsQueryOptions } from './get-teams';

export const updateTeamInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type UpdateTeamInput = z.infer<typeof updateTeamInputSchema>;

export const updateTeam = ({
  data,
  teamId,
}: {
  data: UpdateTeamInput;
  teamId: string;
}): Promise<Team> => {
  return api.patch(`/teams/${teamId}`, data);
};

type UseUpdateTeamOptions = {
  teamId: string;
  config?: MutationConfig<typeof updateTeam>;
};

export const useUpdateTeam = ({
  teamId,
  config,
}: UseUpdateTeamOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = config || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getTeamQueryOptions(teamId).queryKey,
      });
      queryClient.refetchQueries({
        queryKey: getTeamsQueryOptions().queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateTeam,
  });
};
