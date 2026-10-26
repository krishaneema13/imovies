import { request } from './client.js';

export const showApi = {
  getShows: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        params.append(key, val);
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/shows${queryString}`);
  },

  getShowById: (id) => request(`/shows/${id}`),

  lockSeat: (showId, seatNumber) =>
    request(`/shows/${showId}/lock-seat`, {
      method: 'POST',
      body: JSON.stringify({ seatNumber }),
    }),

  unlockSeat: (showId, seatNumber) =>
    request(`/shows/${showId}/unlock-seat`, {
      method: 'POST',
      body: JSON.stringify({ seatNumber }),
    }),

  createShow: (data) =>
    request('/shows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateShow: (id, data) =>
    request(`/shows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteShow: (id) =>
    request(`/shows/${id}`, {
      method: 'DELETE',
    }),
};
