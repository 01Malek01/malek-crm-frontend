import api from './api';

export const getPortfolioReport = () => api.get('/reports/portfolio').then((res) => res.data.data);
