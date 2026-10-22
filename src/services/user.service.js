import api from './api';

// Returns public profile fields only — the API never sends credentials.
export const getUsers = (params) => api.get('/users', { params }).then((res) => res.data.data);

export const createUser = (payload) => api.post('/users', payload).then((res) => res.data.data);
