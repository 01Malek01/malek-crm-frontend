import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequest,
} from '../services/serviceRequest.service';
import { invalidateWorkflow } from './invalidate';

export function useServiceRequests(params) {
  return useQuery({
    queryKey: ['service-requests', params],
    queryFn: () => getServiceRequests(params),
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateServiceRequest(id, payload),
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}
