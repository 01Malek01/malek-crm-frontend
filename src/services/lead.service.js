import api from './api';

const data = (res) => res.data.data;

export const getLeads = (params) => api.get('/leads', { params }).then(data);

export const getLead = (id) => api.get(`/leads/${id}`).then(data);

export const createLead = (payload) => api.post('/leads', payload).then(data);

export const updateLead = (id, payload) => api.patch(`/leads/${id}`, payload).then(data);

export const updateLeadStage = (id, pipelineStage, lostReason) =>
  api.patch(`/leads/${id}/stage`, { pipelineStage, lostReason }).then(data);

export const assignLead = (id, assignedTo) => api.patch(`/leads/${id}/assign`, { assignedTo }).then(data);

export const deleteLead = (id) => api.delete(`/leads/${id}`).then(data);

export const scoreLead = (id) => api.post(`/leads/${id}/score`).then(data);

export const attachConversation = (id, payload) => api.post(`/leads/${id}/conversation`, payload).then(data);

export const getLeadMatches = (id) => api.get(`/leads/${id}/matches`).then(data);
