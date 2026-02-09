import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    fetchAdminPatients,
    fetchPatientProfile,
    registerOfflinePatient,
    fetchHospitals,
    fetchDepartments
} from '../api/client.js';

export function PatientsPanel() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load patients on mount
    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminPatients();
            setPatients(data);
        } catch (err) {
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const viewPatientProfile = async (patientId) => {
        setSelectedPatient(patientId);
        setLoading(true);
        try {
            const data = await fetchPatientProfile(patientId);
            setPatientProfile(data);
        } catch (err) {
            toast.error('Failed to load patient profile');
            setSelectedPatient(null);
        } finally {
            setLoading(false);
        }
    };

    const closeProfile = () => {
        setSelectedPatient(null);
        setPatientProfile(null);
    };

    const filteredPatients = patients.filter(p =>
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>👥 Patients Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowRegisterModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <span>➕</span> Register Walk-in Patient
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    className="input"
                    placeholder="🔍 Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', maxWidth: 500 }}
                />
            </div>

            {/* Patients List */}
            {loading && patients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading patients...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No patients found</h3>
                    <p>{searchTerm ? 'Try adjusting your search' : 'Register your first patient to get started'}</p>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filteredPatients.map((patient) => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            onClick={() => viewPatientProfile(patient.id)}
                        />
                    ))}
                </div>
            )}

            {/* Register Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <RegisterPatientModal
                        onClose={() => setShowRegisterModal(false)}
                        onSuccess={() => {
                            setShowRegisterModal(false);
                            loadPatients();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Patient Profile Modal */}
            <AnimatePresence>
                {selectedPatient && patientProfile && (
                    <PatientProfileModal
                        profile={patientProfile}
                        onClose={closeProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function PatientCard({ patient, onClick }) {
    return (
        <motion.div
            className="card"
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer', padding: 20 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                    <h3 style={{ marginBottom: 4 }}>{patient.username}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{patient.email || 'No email'}</p>
                </div>
                <span className="badge badge-info">{patient.role}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <div className="stat-mini">
                    <div className="stat-label">Total Visits</div>
                    <div className="stat-value">{patient.total_appointments || 0}</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{patient.completed_appointments || 0}</div>
                </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                Joined {new Date(patient.date_joined).toLocaleDateString()}
            </div>
        </motion.div>
    );
}

function RegisterPatientModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        hospital_id: '',
        department_id: '',
        symptoms: '',
        notes: '',
    });
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [autoPassword, setAutoPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchHospitals().then(setHospitals).catch(() => { });
    }, []);

    useEffect(() => {
        if (formData.hospital_id) {
            fetchDepartments(formData.hospital_id).then(setDepartments).catch(() => { });
        } else {
            setDepartments([]);
            setFormData(prev => ({ ...prev, department_id: '' }));
        }
    }, [formData.hospital_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            username: formData.username,
            email: formData.email || undefined,
            password: autoPassword ? undefined : formData.password,
        };

        // Add appointment details if hospital is selected
        if (formData.hospital_id) {
            payload.hospital_id = parseInt(formData.hospital_id);
            if (formData.department_id) payload.department_id = parseInt(formData.department_id);
            if (formData.symptoms) payload.symptoms = formData.symptoms;
            if (formData.notes) payload.notes = formData.notes;
        }

        try {
            const data = await registerOfflinePatient(payload);
            setResult(data);
            toast.success('Patient registered successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to register patient');
            setLoading(false);
        }
    };

    if (result) {
        return (
            <Modal onClose={onClose} title="✅ Patient Registered">
                <div style={{ padding: 20 }}>
                    <div className="success-message" style={{ marginBottom: 20 }}>
                        <h3>Patient {result.patient.username} registered successfully!</h3>
                    </div>

                    <div className="info-box" style={{ marginBottom: 20 }}>
                        <h4>Patient Credentials</h4>
                        <p><strong>Username:</strong> {result.patient.username}</p>
                        {result.patient.email && <p><strong>Email:</strong> {result.patient.email}</p>}
                        {result.patient.temporary_password && (
                            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                                <p style={{ fontSize: 14, marginBottom: 8 }}>
                                    <strong>⚠️ Temporary Password (share with patient):</strong>
                                </p>
                                <p style={{
                                    fontSize: 18,
                                    fontFamily: 'monospace',
                                    color: 'var(--color-primary)',
                                    fontWeight: 'bold'
                                }}>
                                    {result.patient.temporary_password}
                                </p>
                            </div>
                        )}
                    </div>

                    {result.appointment && (
                        <div className="info-box" style={{ marginBottom: 20 }}>
                            <h4>Appointment Created</h4>
                            <p><strong>Status:</strong> <span className="badge badge-success">{result.appointment.status}</span></p>
                            <p><strong>Hospital:</strong> {result.appointment.hospital_name}</p>
                            {result.appointment.department_name && (
                                <p><strong>Department:</strong> {result.appointment.department_name}</p>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => { onSuccess(); onClose(); }}>
                            Done
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal onClose={onClose} title="➕ Register Walk-in Patient">
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Basic Info */}
                    <div>
                        <h4 style={{ marginBottom: 12 }}>Patient Information</h4>

                        <label className="label">
                            Username (required)
                            <input
                                type="text"
                                className="input"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                placeholder="patient_name"
                            />
                        </label>

                        <label className="label">
                            Email (optional)
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="patient@example.com"
                            />
                        </label>

                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={autoPassword}
                                onChange={(e) => setAutoPassword(e.target.checked)}
                            />
                            Auto-generate password
                        </label>

                        {!autoPassword && (
                            <label className="label">
                                Password
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!autoPassword}
                                    placeholder="Enter password"
                                />
                            </label>
                        )}
                    </div>

                    {/* Appointment Details (Optional) */}
                    <div>
                        <h4 style={{ marginBottom: 12 }}>Create Appointment (Optional)</h4>

                        <label className="label">
                            Hospital
                            <select
                                className="input"
                                value={formData.hospital_id}
                                onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                            >
                                <option value="">Select hospital (optional)</option>
                                {hospitals.map((h) => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </label>

                        {formData.hospital_id && (
                            <label className="label">
                                Department
                                <select
                                    className="input"
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                >
                                    <option value="">Select department (optional)</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </label>
                        )}

                        {formData.hospital_id && (
                            <>
                                <label className="label">
                                    Symptoms
                                    <textarea
                                        className="input"
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                        placeholder="Patient's symptoms..."
                                        rows={3}
                                    />
                                </label>

                                <label className="label">
                                    Notes
                                    <textarea
                                        className="input"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Additional notes..."
                                        rows={2}
                                    />
                                </label>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Patient'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

function PatientProfileModal({ profile, onClose }) {
    const { patient, statistics, appointments } = profile;

    return (
        <Modal onClose={onClose} title={`👤 ${patient.username}`} large>
            <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Patient Info */}
                <div className="card" style={{ marginBottom: 20, padding: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Patient Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</p>
                            <p>{patient.email || 'Not provided'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Registered</p>
                            <p>{new Date(patient.date_joined).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Last Login</p>
                            <p>{patient.last_login ? new Date(patient.last_login).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Role</p>
                            <span className="badge badge-info">{patient.role}</span>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="card" style={{ marginBottom: 20, padding: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                        <div className="stat-mini">
                            <div className="stat-label">Total Appointments</div>
                            <div className="stat-value">{statistics.total_appointments}</div>
                        </div>
                        <div className="stat-mini">
                            <div className="stat-label">Completed</div>
                            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                                {statistics.completed}
                            </div>
                        </div>
                        <div className="stat-mini">
                            <div className="stat-label">Confirmed</div>
                            <div className="stat-value" style={{ color: 'var(--color-info)' }}>
                                {statistics.confirmed}
                            </div>
                        </div>
                        <div className="stat-mini">
                            <div className="stat-label">Cancelled</div>
                            <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                                {statistics.cancelled}
                            </div>
                        </div>
                        <div className="stat-mini">
                            <div className="stat-label">Total Spent</div>
                            <div className="stat-value">₹{statistics.total_spent}</div>
                        </div>
                    </div>
                </div>

                {/* Appointment History */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Appointment History</h3>
                    {appointments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>
                            No appointments yet
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {appointments.map((apt) => (
                                <AppointmentItem key={apt.id} appointment={apt} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function AppointmentItem({ appointment }) {
    const statusColors = {
        pending_payment: 'badge-warning',
        confirmed: 'badge-info',
        in_progress: 'badge-primary',
        completed: 'badge-success',
        cancelled: 'badge-error',
    };

    return (
        <div
            className="card"
            style={{
                padding: 16,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                    <h4 style={{ marginBottom: 4 }}>{appointment.hospital_name}</h4>
                    {appointment.department_name && (
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            {appointment.department_name}
                        </p>
                    )}
                </div>
                <span className={`badge ${statusColors[appointment.status]}`}>
                    {appointment.status.replace('_', ' ')}
                </span>
            </div>

            {appointment.symptoms && (
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                    <strong>Symptoms:</strong> {appointment.symptoms}
                </p>
            )}

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span>📅 {new Date(appointment.created_at).toLocaleDateString()}</span>
                <span>💰 ₹{appointment.payment_amount}</span>
                <span className={`badge ${appointment.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {appointment.payment_status}
                </span>
            </div>
        </div>
    );
}

function Modal({ children, onClose, title, large = false }) {
    return (
        <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: large ? '90%' : '600px', maxWidth: large ? '1200px' : '600px' }}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}
