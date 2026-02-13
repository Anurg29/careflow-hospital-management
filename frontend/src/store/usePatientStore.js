import { create } from 'zustand';
import { patientRegister, patientLogin, fetchMyAppointments, fetchPaymentHistory } from '../api/client';

const usePatientStore = create((set, get) => ({
    // State
    patient: null,
    isAuthenticated: false,
    appointments: [],
    payments: [],
    loading: false,
    error: null,

    // Actions
    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const data = await patientRegister(userData);
            set({
                patient: data.user,
                isAuthenticated: true,
                loading: false,
            });
            return data;
        } catch (err) {
            // Parse Django validation errors properly
            let errorMessage = 'Registration failed';
            if (err.response?.data) {
                const errors = err.response.data;
                if (typeof errors === 'object') {
                    // Django returns errors like {"username": ["This field is required."]}
                    const messages = Object.entries(errors)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('; ');
                    errorMessage = messages || errorMessage;
                } else if (errors.detail) {
                    errorMessage = errors.detail;
                } else if (errors.error) {
                    errorMessage = errors.error;
                }
            }
            set({ error: errorMessage, loading: false });
            throw err;
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await patientLogin(credentials);
            set({
                patient: data.user,
                isAuthenticated: true,
                loading: false,
            });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Login failed';
            set({ error: errorMessage, loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
            patient: null,
            isAuthenticated: false,
            appointments: [],
            payments: [],
        });
    },

    loadAppointments: async () => {
        set({ loading: true, error: null });
        try {
            const appointments = await fetchMyAppointments();
            set({ appointments, loading: false });
            return appointments;
        } catch (err) {
            set({ error: 'Failed to load appointments', loading: false });
            throw err;
        }
    },

    loadPaymentHistory: async () => {
        set({ loading: true, error: null });
        try {
            const payments = await fetchPaymentHistory();
            set({ payments, loading: false });
            return payments;
        } catch (err) {
            set({ error: 'Failed to load payment history', loading: false });
            throw err;
        }
    },

    // Hydrate patient from token
    hydrate: async () => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            set({ isAuthenticated: false });
            return;
        }

        set({ loading: true });
        try {
            // Try to load appointments to verify token
            const appointments = await fetchMyAppointments();
            set({
                isAuthenticated: true,
                appointments,
                loading: false,
            });
        } catch (err) {
            // Token invalid or expired
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({
                isAuthenticated: false,
                patient: null,
                loading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));

export default usePatientStore;
