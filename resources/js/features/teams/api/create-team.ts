import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Team } from '@/types/api';



export const createTeamInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().optional(),
  color: z.string().optional(),
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
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['teams'],
      });
      onSuccess?.(data, variables, context);
    },
    ...restConfig,
    mutationFn: createTeam,
  });
};
