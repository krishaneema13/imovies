import { request } from './client.js';

export const bookingApi = {
  createBooking: (bookingData) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  getMyBookings: () => request('/bookings/my'),

  getBookingById: (id) => request(`/bookings/${id}`),

  cancelBooking: (id, reason) =>
    request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getAllBookings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/bookings${queryString}`);
  },
};
