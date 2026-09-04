/**
 * Centralized API client. All requests go through here so offline
 * detection, base URL config, and error shape stay consistent everywhere.
 *
 * In dev, Vite's proxy (vite.config.js) forwards /api/* to the backend on
 * :5000, so relative paths work locally and in most deployments where the
 * frontend is served from the same origin as the API. If you deploy the
 * frontend and backend separately (e.g. Vercel + Render), set
 * VITE_API_URL in a .env file at the frontend root.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  if (!navigator.onLine) {
    throw new ApiError('You appear to be offline.', 0, null);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // non-JSON response
  }

  if (!res.ok) {
    throw new ApiError(body?.message || `Request failed (${res.status})`, res.status, body);
  }

  return body;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError };

// --- Resource-specific helpers ---

export const patientsApi = {
  create: (data) => api.post('/api/patients', data),
  getAll: () => api.get('/api/patients'),
  getById: (id) => api.get(`/api/patients/${id}`),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  remove: (id) => api.delete(`/api/patients/${id}`),
};

export const caregiversApi = {
  create: (data) => api.post('/api/caregivers', data),
  getAll: () => api.get('/api/caregivers'),
  getById: (id) => api.get(`/api/caregivers/${id}`),
  findByIdentifier: (identifier) => api.get(`/api/caregivers/find/${encodeURIComponent(identifier)}`),
  update: (id, data) => api.put(`/api/caregivers/${id}`, data),
  linkPatient: (id, patientId) => api.put(`/api/caregivers/${id}/link`, { patientId }),
  getDashboard: (id) => api.get(`/api/caregivers/${id}/dashboard`),
};

export const scoresApi = {
  submit: (data) => api.post('/api/scores', data),
  getForPatient: (patientId, params = '') => api.get(`/api/scores/patient/${patientId}${params}`),
  getSummary: (patientId) => api.get(`/api/scores/patient/${patientId}/summary`),
};

export const remindersApi = {
  create: (data) => api.post('/api/reminders', data),
  getForPatient: (patientId, status) =>
    api.get(`/api/reminders/patient/${patientId}${status ? `?status=${status}` : ''}`),
  updateStatus: (id, data) => api.patch(`/api/reminders/${id}/status`, data),
  update: (id, data) => api.put(`/api/reminders/${id}`, data),
  remove: (id) => api.delete(`/api/reminders/${id}`),
  checkMissed: (data) => api.post('/api/reminders/check-missed', data),
};

export const alertsApi = {
  create: (data) => api.post('/api/alerts', data),
  getForPatient: (patientId, resolved) =>
    api.get(`/api/alerts/patient/${patientId}${resolved !== undefined ? `?resolved=${resolved}` : ''}`),
  resolve: (id) => api.patch(`/api/alerts/${id}/resolve`),
};

export const moodsApi = {
  submit: (data) => api.post('/api/moods', data),
  getForPatient: (patientId, limit) =>
    api.get(`/api/moods/patient/${patientId}${limit ? `?limit=${limit}` : ''}`),
};

export const voiceApi = {
  command: (data) => api.post('/api/voice/command', data),
};

export const reminiscenceApi = {
  getThemes: () => api.get('/api/reminiscence/themes'),
  generateStory: (data) => api.post('/api/reminiscence/story', data),
  getChapter: (themeKey, chapterIndex, patientId) =>
    api.get(`/api/reminiscence/chapter/${themeKey}/${chapterIndex}${patientId ? `?patientId=${patientId}` : ''}`),
  recordInteraction: (data) => api.post('/api/reminiscence/interaction', data),
  getProgress: (patientId) => api.get(`/api/reminiscence/progress/${patientId}`),
};

function authRequest(path, options = {}) {
  const token = localStorage.getItem('neuronest_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request(`${BASE_URL}${path}`, { ...options, headers });
}

export const authApi = {
  sendOtp: (identifier, purpose) => authRequest('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ identifier, purpose }) }),
  verifyOtp: (data) => authRequest('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => authRequest('/api/auth/me'),
};

