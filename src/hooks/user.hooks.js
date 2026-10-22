import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, getUsers } from '../services/user.service';
import { changePasswordRequest } from '../services/auth.service';

export function useUsers(params, enabled = true) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePasswordRequest });
}
