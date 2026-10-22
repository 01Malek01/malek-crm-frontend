import api from './api';

const data = (res) => res.data.data;

export const getProperties = (params) => api.get('/properties', { params }).then(data);

export const getProperty = (id) => api.get(`/properties/${id}`).then(data);

export const createProperty = (payload) => api.post('/properties', payload).then(data);

export const updatePropertyStatus = (id, status) =>
  api.patch(`/properties/${id}/status`, { status }).then(data);

export const deleteProperty = (id) => api.delete(`/properties/${id}`).then(data);
