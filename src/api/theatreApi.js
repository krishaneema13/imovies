import { request } from './client.js';

export const theatreApi = {
  getTheatres: (city) => {
    const query = city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : '';
    return request(`/theatres${query}`);
  },

  getTheatreById: (id) => request(`/theatres/${id}`),

  createTheatre: (data) =>
    request('/theatres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTheatre: (id, data) =>
    request(`/theatres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTheatre: (id) =>
    request(`/theatres/${id}`, {
      method: 'DELETE',
    }),
};
