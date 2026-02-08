import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, CreditCard, LogOut, User,
    FileText, Activity, ArrowRight, CheckCircle,
    XCircle, Clock as ClockIcon, AlertCircle
} from 'lucide-react';
import usePatientStore from '../store/usePatientStore';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const { patient, appointments, loadAppointments, logout, isAuthenticated } = usePatientStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/patient/auth');
            return;
        }

        loadAppointments().finally(() => setLoading(false));
    }, [isAuthenticated, navigate, loadAppointments]);

    const handleLogout = () => {
        logout();
        navigate('/patient/auth');
    };

    const getStatusColor = (status) => {
        const colors = {
            pending_payment: 'text-yellow-600 bg-yellow-50',
            confirmed: 'text-blue-600 bg-blue-50',
            in_progress: 'text-purple-600 bg-purple-50',
            completed: 'text-green-600 bg-green-50',
            cancelled: 'text-red-600 bg-red-50',
        };
        return colors[status] || 'text-gray-600 bg-gray-50';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending_payment: AlertCircle,
            confirmed: CheckCircle,
            in_progress: ClockIcon,
            completed: CheckCircle,
            cancelled: XCircle,
        };
        const Icon = icons[status] || FileText;
        return <Icon className="w-4 h-4" />;
    };

    const upcomingAppointments = appointments.filter(
        a => ['confirmed', 'in_progress'].includes(a.status)
    );

    const stats = [
        {
            label: 'Total Appointments',
            value: appointments.length,
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Upcoming',
            value: upcomingAppointments.length,
            icon: ClockIcon,
            color: 'from-teal-500 to-teal-600',
        },
        {
            label: 'Completed',
            value: appointments.filter(a => a.status === 'completed').length,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                Welcome back, {patient?.full_name || patient?.username}!
                            </h1>
                            <p className="text-sm text-gray-500">Manage your appointments</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/patient/book-appointment')}
                        className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-2xl hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl group"
                    >
                        <Calendar className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold mb-1">Book Appointment</h3>
                        <p className="text-sm text-teal-50 mb-2">Schedule a new visit</p>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/patient/my-appointments')}
                        className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-teal-500 hover:shadow-lg transition-all group"
                    >
                        <FileText className="w-8 h-8 mb-3 text-gray-700" />
                        <h3 className="font-semibold text-gray-800 mb-1">My Appointments</h3>
                        <p className="text-sm text-gray-600 mb-2">View history</p>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                        onClick={() => navigate('/patient/queue-status')}
                        className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group"
                    >
                        <Activity className="w-8 h-8 mb-3 text-gray-700" />
                        <h3 className="font-semibold text-gray-800 mb-1">Queue Status</h3>
                        <p className="text-sm text-gray-600 mb-2">Check wait times</p>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                        onClick={() => navigate('/patient/payments')}
                        className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:border-purple-500 hover:shadow-lg transition-all group"
                    >
                        <CreditCard className="w-8 h-8 mb-3 text-gray-700" />
                        <h3 className="font-semibold text-gray-800 mb-1">Payments</h3>
                        <p className="text-sm text-gray-600 mb-2">View history</p>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
                        <button
                            onClick={() => navigate('/patient/my-appointments')}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                        >
                            View All →
                        </button>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Appointments Yet</h3>
                            <p className="text-gray-600 mb-6">Book your first appointment to get started</p>
                            <button
                                onClick={() => navigate('/patient/book-appointment')}
                                className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all"
                            >
                                Book Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.slice(0, 5).map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => navigate('/patient/my-appointments')}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-800">{appointment.hospital_name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {appointment.department_name && (
                                                <p className="text-sm text-gray-600 mb-1">{appointment.department_name}</p>
                                            )}
                                            {appointment.symptoms && (
                                                <p className="text-sm text-gray-500">Symptoms: {appointment.symptoms}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-800">₹{appointment.payment_amount}</p>
                                            <p className="text-xs text-gray-500">{new Date(appointment.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
