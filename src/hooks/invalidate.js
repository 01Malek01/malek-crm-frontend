// Scenario steps touch leads, units, deals and reports at once — refresh them together.
export const WORKFLOW_KEYS = ['leads', 'properties', 'deals', 'installments', 'activities', 'service-requests', 'reports'];

export function invalidateWorkflow(queryClient) {
  return Promise.all(WORKFLOW_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}
