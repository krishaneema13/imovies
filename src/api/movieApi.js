import { request } from './client.js';

export const movieApi = {
  getMovies: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        params.append(key, val);
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/movies${queryString}`);
  },

  getMovieById: (id) => request(`/movies/${id}`),

  getFilterOptions: () => request('/movies/filters/options'),

  createMovie: (data) =>
    request('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMovie: (id, data) =>
    request(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMovie: (id) =>
    request(`/movies/${id}`, {
      method: 'DELETE',
    }),
};
