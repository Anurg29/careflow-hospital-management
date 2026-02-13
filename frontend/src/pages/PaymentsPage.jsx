import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CreditCard, CheckCircle, XCircle, Clock,
    IndianRupee, Receipt, Loader, AlertCircle
} from 'lucide-react';
import { fetchPaymentHistory, initiatePayment, verifyPayment, fetchMyAppointments } from '../api/client';

export default function PaymentsPage() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [paymentData, appointmentData] = await Promise.all([
                fetchPaymentHistory(),
                fetchMyAppointments()
            ]);
            setPayments(paymentData);
            // Filter appointments pending payment
            const pending = appointmentData.filter(a => a.payment_status === 'pending');
            setPendingAppointments(pending);
        } catch (err) {
            setError('Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    const handlePayWithRazorpay = async (appointment) => {
        setProcessing(true);
        setError(null);

        try {
            // Step 1: Initiate payment on backend
            const paymentData = await initiatePayment({
                appointment_id: appointment.id,
                gateway: 'razorpay'
            });

            // Step 2: Open Razorpay checkout
            const options = {
                key: paymentData.razorpay_key_id,
                amount: paymentData.amount * 100, // Razorpay expects paise
                currency: paymentData.currency || 'INR',
                name: 'CareFlow Hospital',
                description: `Appointment #${appointment.id} - ${appointment.hospital_name}`,
                order_id: paymentData.razorpay_order_id,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyResult = await verifyPayment({
                            transaction_id: paymentData.transaction_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setSuccess('Payment successful! Your appointment is confirmed.');
                        loadData(); // Refresh data
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: appointment.patient_name || '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#14b8a6' // Teal color matching CareFlow theme
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleTestPayment = async (appointment) => {
        setProcessing(true);
        setError(null);

        try {
            // Initiate test payment
            const paymentData = await initiatePayment({
                appointment_id: appointment.id,
                gateway: 'test'
            });

            // Verify test payment immediately
            const verifyResult = await verifyPayment({
                transaction_id: paymentData.transaction_id,
                test_mode: true,
                payment_method: 'test_card'
            });

            setSuccess('Test payment successful! Your appointment is confirmed.');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                            <p className="text-gray-600">Manage your payment history</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Alerts */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                    >
                        <XCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-700">{success}</p>
                        <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">×</button>
                    </motion.div>
                )}

                {/* Pending Payments */}
                {pendingAppointments.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            Pending Payments
                        </h2>
                        <div className="space-y-4">
                            {pendingAppointments.map((appointment) => (
                                <motion.div
                                    key={appointment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm border-2 border-yellow-200 p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg">{appointment.hospital_name}</h3>
                                            {appointment.department_name && (
                                                <p className="text-gray-600">{appointment.department_name}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">
                                                Appointment #{appointment.id} • {new Date(appointment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-800 flex items-center gap-1">
                                                <IndianRupee className="w-5 h-5" />
                                                {appointment.payment_amount}
                                            </p>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Payment Pending
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handlePayWithRazorpay(appointment)}
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {processing ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-5 h-5" />
                                                    Pay with Razorpay
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleTestPayment(appointment)}
                                            disabled={processing}
                                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            Test Payment
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment History */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-teal-500" />
                        Payment History
                    </h2>

                    {payments.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Yet</h3>
                            <p className="text-gray-600">Your payment history will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment, idx) => (
                                <motion.div
                                    key={payment.transaction_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        payment.status === 'success' ? 'bg-green-100' :
                                        payment.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                                    }`}>
                                        {getStatusIcon(payment.status)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{payment.appointment?.hospital || 'Appointment'}</p>
                                        <p className="text-sm text-gray-500">
                                            {payment.transaction_id} • {new Date(payment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4" />
                                            {payment.amount}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
