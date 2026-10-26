import { request } from './client.js';

export const notificationApi = {
  getMyNotifications: () => request('/notifications'),
  markAsRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllAsRead: () =>
    request('/notifications/read-all', {
      method: 'PUT',
    }),
};
