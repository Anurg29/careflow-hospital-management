import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers (stored in memory + sessionStorage for tab persistence) ───
const TOKEN_KEY = 'careflow_access';
const REFRESH_KEY = 'careflow_refresh';

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  sessionStorage.setItem(TOKEN_KEY, access);
  if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn() {
  return !!getAccessToken();
}

// ─── Request interceptor: attach Bearer token ───
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh expired tokens ───
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we have a refresh token, try to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken() &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${apiBase}/api/auth/refresh/`, {
          refresh: getRefreshToken(),
        });
        setTokens(data.access, data.refresh || getRefreshToken());
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Dispatch custom event so App.jsx can redirect to login
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Auth API ───
export const endpoints = {
  register: '/api/auth/register/',
  login: '/api/auth/login/',
  refresh: '/api/auth/refresh/',
  logout: '/api/auth/logout/',
  profile: '/api/auth/profile/',
  status: (hospitalId) => `/api/status/${hospitalId}/`,
  dashboard: (hospitalId) => `/api/dashboard/${hospitalId}/`,
  queue: '/api/queue/',
  queueItem: (id) => `/api/queue/${id}/`,
  queueStart: (id) => `/api/queue/${id}/start/`,
  queueComplete: (id) => `/api/queue/${id}/complete/`,
  beds: '/api/beds/',
  hospitals: '/api/hospitals/',
  departments: '/api/departments/',
  appointments: '/api/appointments/',
  patientQueue: (id) => `/api/patient/queue/${id}/`,
};

export async function register(payload) {
  const { data } = await api.post(endpoints.register, payload);
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function login(username, password) {
  const { data } = await api.post(endpoints.login, { username, password });
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function logout() {
  try {
    await api.post(endpoints.logout, { refresh: getRefreshToken() });
  } catch {
    // ignore if token already invalid
  }
  clearTokens();
}

export async function fetchProfile() {
  const { data } = await api.get(endpoints.profile);
  return data;
}

// ─── Data API (unchanged signatures) ───
export async function fetchStatus(hospitalId) {
  const { data } = await api.get(endpoints.status(hospitalId));
  return data;
}

export async function fetchHospitals() {
  const { data } = await api.get(endpoints.hospitals);
  return data;
}

export async function createHospital(payload) {
  const { data } = await api.post(endpoints.hospitals, payload);
  return data;
}

export async function fetchDepartments(hospitalId) {
  const { data } = await api.get(endpoints.departments, { params: { hospital: hospitalId } });
  return data;
}

export async function createDepartment(payload) {
  const { data } = await api.post(endpoints.departments, payload);
  return data;
}

export async function fetchQueue(hospitalId, statusFilter) {
  const params = {};
  if (hospitalId) params.hospital = hospitalId;
  if (statusFilter) params.status = statusFilter;
  const { data } = await api.get(endpoints.queue, { params });
  return data;
}

export async function createQueueEntry(payload) {
  const { data } = await api.post(endpoints.queue, payload);
  return data;
}

// Join queue for patients (FCFS system)
export async function joinQueue(payload) {
  const { data } = await api.post(endpoints.queue, payload);
  return data;
}

export async function fetchQueueEntry(id) {
  const { data } = await api.get(endpoints.queueItem(id));
  return data;
}

export async function fetchPatientQueue(id) {
  const { data } = await api.get(endpoints.patientQueue(id));
  return data;
}

export async function startQueue(id) {
  const { data } = await api.post(endpoints.queueStart(id));
  return data;
}

export async function completeQueue(id) {
  const { data } = await api.post(endpoints.queueComplete(id));
  return data;
}

export async function fetchBeds(hospitalId) {
  const params = {};
  if (hospitalId) params.hospital = hospitalId;
  const { data } = await api.get(endpoints.beds, { params });
  return data;
}

export async function createBed(payload) {
  const { data } = await api.post(endpoints.beds, payload);
  return data;
}

export async function fetchAppointments(params) {
  const { hospital, department, is_booked } = params;
  const { data } = await api.get(endpoints.appointments, { params: { hospital, department, is_booked } });
  return data;
}

export async function fetchDashboard(hospitalId) {
  const { data } = await api.get(endpoints.dashboard(hospitalId));
  return data;
}

// ─── Patient API Functions ───

export async function patientRegister(userData) {
  const { data } = await api.post('/api/patient/register/', userData);
  if (data.tokens) {
    sessionStorage.setItem('careflow_access', data.tokens.access);
    sessionStorage.setItem('careflow_refresh', data.tokens.refresh);
  }
  return data;
}

export async function patientLogin(credentials) {
  const { data } = await api.post('/api/patient/login/', credentials);
  if (data.tokens) {
    sessionStorage.setItem('careflow_access', data.tokens.access);
    sessionStorage.setItem('careflow_refresh', data.tokens.refresh);
  }
  return data;
}

export async function fetchHospitalsList() {
  const { data } = await api.get('/api/patient/hospitals/');
  return data;
}

export async function fetchDepartmentsList(hospitalId) {
  const params = hospitalId ? { hospital_id: hospitalId } : {};
  const { data } = await api.get('/api/patient/departments/', { params });
  return data;
}

export async function fetchAvailableSlots(params) {
  const { data } = await api.get('/api/patient/available-slots/', { params });
  return data;
}

export async function bookAppointment(appointmentData) {
  const { data } = await api.post('/api/patient/book-appointment/', appointmentData);
  return data;
}

export async function fetchMyAppointments() {
  const { data } = await api.get('/api/patient/my-appointments/');
  return data;
}

export async function cancelAppointment(appointmentId) {
  const { data } = await api.delete(`/api/patient/appointments/${appointmentId}/cancel/`);
  return data;
}

export async function fetchQueueStatus(hospitalId) {
  const { data } = await api.get(`/api/patient/queue-status/${hospitalId}/`);
  return data;
}

// ─── Payment API Functions ───

export async function initiatePayment(paymentData) {
  const { data } = await api.post('/api/patient/payment/initiate/', paymentData);
  return data;
}

export async function verifyPayment(verificationData) {
  const { data } = await api.post('/api/patient/payment/verify/', verificationData);
  return data;
}

export async function fetchPaymentStatus(transactionId) {
  const { data } = await api.get(`/api/patient/payment/status/${transactionId}/`);
  return data;
}

export async function fetchPaymentHistory() {
  const { data } = await api.get('/api/patient/payment/history/');
  return data;
}

// ─── Admin API Functions ───

export async function fetchAdminAppointments(params = {}) {
  const { data } = await api.get('/api/admin/appointments/', { params });
  return data;
}

export async function fetchAdminAppointmentDetail(appointmentId) {
  const { data } = await api.get(`/api/admin/appointments/${appointmentId}/`);
  return data;
}

export async function updateAppointmentStatus(appointmentId, statusData) {
  const { data } = await api.patch(`/api/admin/appointments/${appointmentId}/status/`, statusData);
  return data;
}

export async function fetchAdminDashboardStats() {
  const { data } = await api.get('/api/admin/dashboard/stats/');
  return data;
}

export async function fetchAdminPatients() {
  const { data } = await api.get('/api/admin/patients/');
  return data;
}

// ✨ NEW: Register offline/walk-in patient
export async function registerOfflinePatient(patientData) {
  const { data } = await api.post('/api/admin/patients/register/', patientData);
  return data;
}

// ✨ NEW: Get detailed patient profile with history
export async function fetchPatientProfile(patientId) {
  const { data } = await api.get(`/api/admin/patients/${patientId}/`);
  return data;
}
