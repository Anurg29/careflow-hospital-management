import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import usePatientStore from '../store/usePatientStore';
import { cancelAppointment } from '../api/client';

export default function MyAppointments() {
    const navigate = useNavigate();
    const { appointments, loadAppointments, isAuthenticated } = usePatientStore();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/patient/auth');
            return;
        }
        loadAppointments().finally(() => setLoading(false));
    }, [isAuthenticated, navigate, loadAppointments]);

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await cancelAppointment(id);
            loadAppointments();
            alert('Appointment cancelled successfully');
        } catch (err) {
            alert('Failed to cancel: ' + (err.response?.data?.error || err.message));
        }
    };

    const filteredAppointments = filter === 'all'
        ? appointments
        : appointments.filter(a => a.status === filter);

    const getStatusColor = (status) => {
        const colors = {
            pending_payment: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
            in_progress: 'text-purple-600 bg-purple-50 border-purple-200',
            completed: 'text-green-600 bg-green-50 border-green-200',
            cancelled: 'text-red-600 bg-red-50 border-red-200',
        };
        return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending_payment: AlertCircle,
            confirmed: CheckCircle,
            in_progress: Clock,
            completed: CheckCircle,
            cancelled: XCircle,
        };
        return icons[status] || Calendar;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:border-teal-500'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Appointments</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' ? "You haven't booked any appointments yet" : `No ${filter} appointments`}
                        </p>
                        <button
                            onClick={() => navigate('/patient/book-appointment')}
                            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all"
                        >
                            Book Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => {
                            const StatusIcon = getStatusIcon(appointment.status);
                            const canCancel = ['pending_payment', 'confirmed'].includes(appointment.status);

                            return (
                                <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{appointment.hospital_name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${getStatusColor(appointment.status)}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {appointment.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {appointment.department_name && (
                                                <p className="text-gray-600 mb-1">{appointment.department_name}</p>
                                            )}
                                            <p className="text-sm text-gray-500">Appointment ID: #{appointment.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-800">₹{appointment.payment_amount}</p>
                                            <p className="text-xs text-gray-500">{appointment.payment_status}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Symptoms</p>
                                            <p className="text-gray-800">{appointment.symptoms || 'Not specified'}</p>
                                        </div>
                                        {appointment.notes && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Notes</p>
                                                <p className="text-gray-800">{appointment.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="text-sm text-gray-600">
                                            <p>Booked: {new Date(appointment.created_at).toLocaleString()}</p>
                                            {appointment.confirmed_at && (
                                                <p>Confirmed: {new Date(appointment.confirmed_at).toLocaleString()}</p>
                                            )}
                                        </div>
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(appointment.id)}
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
