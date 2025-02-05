import { useMutation, useQueryClient } from  '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

import { getUserQueryOptions } from './get-user';

export const updateUserInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  passwordConfirmation: z.string().min(6).optional(),
  roleCode: z.string().optional(),
});


export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateUser = ({
  data,
  userId,
}: {
  data: UpdateUserInput;
  userId: string;
}): Promise<User> => {
  return api.patch(`/users/${userId}`, data);
};

type UseUpdateUserOptions = {
  userId: string;
  mutationConfig?: MutationConfig<typeof updateUser>;
};

export const useUpdateUser = ({
  userId,
  mutationConfig,
}: UseUpdateUserOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (res : any, ...args ) => {
      queryClient.refetchQueries({
        queryKey: getUserQueryOptions(userId).queryKey,
      });
      onSuccess?.(res, ...args);
    },
    ...restConfig,
    mutationFn: updateUser,
  });
};
