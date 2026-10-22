import api from './api';

const data = (res) => res.data.data;

export const getServiceRequests = (params) => api.get('/service-requests', { params }).then(data);

export const createServiceRequest = (payload) => api.post('/service-requests', payload).then(data);

export const updateServiceRequest = (id, payload) =>
  api.patch(`/service-requests/${id}`, payload).then(data);
