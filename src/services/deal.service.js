import api from './api';

const data = (res) => res.data.data;

export const getDeals = (params) => api.get('/deals', { params }).then(data);

export const getDeal = (id) => api.get(`/deals/${id}`).then(data);

export const getInstallments = (params) => api.get('/deals/installments', { params }).then(data);

export const createQuotation = (payload) => api.post('/deals', payload).then(data);

// Scenario steps: reserve, submit-approval, approve, reject, contract, payment-plan,
// handover, cancel, renew, upsell.
export const runDealAction = (id, action, payload = {}) =>
  api.post(`/deals/${id}/${action}`, payload).then(data);

export const recordPayment = (id, seq, payload) =>
  api.post(`/deals/${id}/installments/${seq}/pay`, payload).then(data);
