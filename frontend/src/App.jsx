import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing page
import LandingPage from './pages/LandingPage.jsx';

// Original hospital admin dashboard
import HospitalDashboard from './original_App.jsx';

// Patient pages
import PatientAuth from './pages/PatientAuth.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import QueueStatus from './pages/QueueStatus.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';

// Protected Route Component
function ProtectedRoute({ children }) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        return <Navigate to="/patient/auth" replace />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Hospital Admin Dashboard (Original) */}
                <Route path="/admin" element={<HospitalDashboard />} />
                <Route path="/admin/dashboard" element={<HospitalDashboard />} />

                {/* Patient Routes */}
                <Route path="/patient/auth" element={<PatientAuth />} />
                <Route
                    path="/patient/dashboard"
                    element={
                        <ProtectedRoute>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/book-appointment"
                    element={
                        <ProtectedRoute>
                            <BookAppointment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/my-appointments"
                    element={
                        <ProtectedRoute>
                            <MyAppointments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/queue-status"
                    element={
                        <ProtectedRoute>
                            <QueueStatus />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient/payments"
                    element={
                        <ProtectedRoute>
                            <PaymentsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect /patient to auth */}
                <Route path="/patient" element={<Navigate to="/patient/auth" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
