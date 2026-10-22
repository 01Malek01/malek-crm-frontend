import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProperty,
  deleteProperty,
  getProperties,
  updatePropertyStatus,
} from '../services/property.service';
import { invalidateWorkflow } from './invalidate';

export function useProperties(params) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => getProperties(params),
  });
}

function usePropertyMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export const useCreateProperty = () => usePropertyMutation(createProperty);
export const useUpdatePropertyStatus = () =>
  usePropertyMutation(({ id, status }) => updatePropertyStatus(id, status));
export const useDeleteProperty = () => usePropertyMutation(deleteProperty);
