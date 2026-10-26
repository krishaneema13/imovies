import { request } from './client.js';

export const adminApi = {
  getStats: () => request('/admin/stats'),
};
