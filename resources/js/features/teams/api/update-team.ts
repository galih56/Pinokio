import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Team } from '@/types/api';

export const updateTeamInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  description: z.string().optional(),
  members: z.array(z.string()).optional(), // Added members to the schema
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

  const { onSuccess, onError, ...restConfig } = config || {};

  return useMutation({
    ...restConfig,
    mutationFn: updateTeam,
    onMutate: async ({ data, teamId }) => {
      await queryClient.cancelQueries({ queryKey: ['teams'] });

      const previousTeams = queryClient.getQueryData<Team[]>(['teams']);

      queryClient.setQueryData<Team[]>(['teams'], (oldTeams) => {
        if (!oldTeams) return [];

        return oldTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                ...data, // Updates all fields including members
                members: data.members ? data.members : team.members, // Specifically update members if provided
              }
            : team
        );
      });

      return { previousTeams };
    },
    onSuccess: (res: any, ...args) => {
      queryClient.refetchQueries({
        queryKey: ['teams'],
      });
      onSuccess?.(res, ...args);
    },
    onError,
  });
};
