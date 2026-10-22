import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQuotation,
  getDeal,
  getDeals,
  getInstallments,
  recordPayment,
  runDealAction,
} from '../services/deal.service';
import { invalidateWorkflow } from './invalidate';

export function useDeals(params) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => getDeals(params),
  });
}

export function useDeal(id) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => getDeal(id),
    enabled: Boolean(id),
  });
}

export function useInstallments(params) {
  return useQuery({
    queryKey: ['installments', params],
    queryFn: () => getInstallments(params),
  });
}

function useDealMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidateWorkflow(queryClient),
  });
}

export const useCreateQuotation = () => useDealMutation(createQuotation);

/** Runs any scenario step: `mutate({ id, action: 'reserve', payload })`. */
export const useDealAction = () =>
  useDealMutation(({ id, action, payload }) => runDealAction(id, action, payload));

export const useRecordPayment = () =>
  useDealMutation(({ id, seq, payload }) => recordPayment(id, seq, payload));
