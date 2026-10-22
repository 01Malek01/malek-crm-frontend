import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// Auth endpoints must not trigger the silent-refresh retry (avoids loops).
const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];
const isAuthPath = (url = '') => AUTH_PATHS.some((path) => url.includes(path));

// Public routes (no session) must never be hard-redirected to /login.
const PUBLIC_PATHS = ['/login', '/demo'];
const isPublicPath = () => PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));

let refreshPromise = null;

const redirectToLogin = () => {
  if (!isPublicPath()) {
    window.location.assign('/login');
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Access token expired: refresh once, then replay the original request.
    if (response?.status === 401 && config && !config._retry && !isAuthPath(config.url)) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh').finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(config);
      } catch {
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
