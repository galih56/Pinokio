import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Team } from '@/types/api';
import { subYears } from 'date-fns';
import { getTeamsQueryOptions } from './get-teams';



export const createTeamInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateTeamInput = z.infer<typeof createTeamInputSchema>;

export const createTeam = (data : CreateTeamInput): Promise<Team> => {
  return api.post(`/teams`, data);
};

type UseCreateTeamOptions = {
  mutationConfig?: MutationConfig<typeof createTeam>;
};

export const useCreateTeam = ({
  mutationConfig,
}: UseCreateTeamOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getTeamsQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createTeam,
  });
};
