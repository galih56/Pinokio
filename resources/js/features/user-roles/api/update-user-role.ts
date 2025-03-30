import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UserRole } from '@/types/api';

import { getUserRoleQueryOptions } from './get-user-role';
import { getUserRolesQueryOptions } from './get-user-roles';

export const updateUserRoleInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleInputSchema>;

export const updateUserRole = ({
  data,
  userRoleId,
}: {
  data: UpdateUserRoleInput;
  userRoleId: string;
}): Promise<UserRole> => {
  return api.patch(`/user_roles/${userRoleId}`, data);
};

type UseUpdateUserRoleOptions = {
  userRoleId: string;
  config?: MutationConfig<typeof updateUserRole>;
};

export const useUpdateUserRole = ({
  userRoleId,
  config,
}: UseUpdateUserRoleOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = config || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.invalidateQueries({
        queryKey: getUserRoleQueryOptions(userRoleId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getUserRolesQueryOptions().queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateUserRole,
  });
};
