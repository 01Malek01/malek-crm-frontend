import api from './api';

const data = (res) => res.data.data;

export const getActivities = (params) => api.get('/activities', { params }).then(data);

export const createActivity = (payload) => api.post('/activities', payload).then(data);

export const updateActivity = (id, payload) => api.patch(`/activities/${id}`, payload).then(data);
