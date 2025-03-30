import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UserRole } from '@/types/api';

import { getUserRolesQueryOptions } from './get-user-roles';


export const createUserRoleInputSchema = z.object({
  code: z.string()
    .min(2, "Code must be at least 2 characters long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores are allowed"),
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().optional(),
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
