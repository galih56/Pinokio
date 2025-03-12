import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UserRole } from '@/types/api';
import { subYears } from 'date-fns';

import { getUserRolesQueryOptions } from './get-user_roles';


export const createUserRoleInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateUserRoleInput = z.infer<typeof createUserRoleInputSchema>;

export const createUserRole = (data : CreateUserRoleInput): Promise<UserRole> => {
  return api.post(`/user_roles`, data);
};

type UseCreateUserRoleOptions = {
  mutationConfig?: MutationConfig<typeof createUserRole>;
};

export const useCreateUserRole = ({
  mutationConfig,
}: UseCreateUserRoleOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args : any) => {
      queryClient.invalidateQueries({
        queryKey: getUserRolesQueryOptions().queryKey,
      });
      onSuccess?.(args);
    },
    ...restConfig,
    mutationFn: createUserRole,
  });
};
