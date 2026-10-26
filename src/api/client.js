const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = envApiUrl
  ? envApiUrl.endsWith('/api')
    ? envApiUrl
    : `${envApiUrl.replace(/\/$/, '')}/api`
  : typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api'
  : 'http://localhost:5000/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('imovies_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};
