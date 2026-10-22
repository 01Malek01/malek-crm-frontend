import api from './api';

// Sessions live in httpOnly cookies, so these calls carry no token.
export const loginRequest = (credentials) =>
  api.post('/auth/login', credentials).then((res) => res.data.data);

export const meRequest = () => api.get('/auth/me').then((res) => res.data.data);

export const logoutRequest = () => api.post('/auth/logout').then((res) => res.data.data);

export const changePasswordRequest = (payload) =>
  api.patch('/auth/password', payload).then((res) => res.data.data);
