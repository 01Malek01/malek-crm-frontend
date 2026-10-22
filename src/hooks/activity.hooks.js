import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createActivity, getActivities, updateActivity } from '../services/activity.service';
import { invalidateWorkflow } from './invalidate';

export function useActivities(params) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateActivity(id, payload),
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}
