import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignLead,
  attachConversation,
  createLead,
  deleteLead,
  getLead,
  getLeadMatches,
  getLeads,
  scoreLead,
  updateLead,
  updateLeadStage,
} from '../services/lead.service';
import { invalidateWorkflow } from './invalidate';

export function useLeads(params) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeads(params),
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => getLead(id),
    enabled: Boolean(id),
  });
}

export function useLeadMatches(leadId, enabled = true) {
  return useQuery({
    queryKey: ['leads', leadId, 'matches'],
    queryFn: () => getLeadMatches(leadId),
    enabled: Boolean(leadId) && enabled,
  });
}

function useLeadMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export const useCreateLead = () => useLeadMutation(createLead);
export const useUpdateLead = () => useLeadMutation(({ id, payload }) => updateLead(id, payload));
export const useUpdateLeadStage = () =>
  useLeadMutation(({ id, stage, lostReason }) => updateLeadStage(id, stage, lostReason));
export const useAssignLead = () => useLeadMutation(({ id, assignedTo }) => assignLead(id, assignedTo));
export const useDeleteLead = () => useLeadMutation(deleteLead);
export const useScoreLead = () => useLeadMutation(scoreLead);
export const useAttachConversation = () => useLeadMutation(({ id, payload }) => attachConversation(id, payload));
