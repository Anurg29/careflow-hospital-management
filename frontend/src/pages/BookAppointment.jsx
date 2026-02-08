import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Stethoscope, Calendar, FileText, CreditCard,
    ArrowLeft, ArrowRight, Check, Loader
} from 'lucide-react';
import {
    fetchHospitalsList, fetchDepartmentsList, fetchAvailableSlots,
    bookAppointment, initiatePayment, verifyPayment
} from '../api/client';

export default function BookAppointment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [slots, setSlots] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        hospital_id: '',
        department_id: '',
        appointment_slot_id: '',
        symptoms: '',
        notes: '',
        payment_amount: 500,
    });

    // Created records
    const [appointment, setAppointment] = useState(null);
    const [payment, setPayment] = useState(null);

    useEffect(() => {
        loadHospitals();
    }, []);

    useEffect(() => {
        if (formData.hospital_id) {
            loadDepartments();
        }
    }, [formData.hospital_id]);

    useEffect(() => {
        if (formData.hospital_id && formData.department_id) {
            loadSlots();
        }
    }, [formData.hospital_id, formData.department_id]);

    const loadHospitals = async () => {
        try {
            const data = await fetchHospitalsList();
            setHospitals(data);
        } catch (err) {
            console.error('Failed to load hospitals:', err);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await fetchDepartmentsList(formData.hospital_id);
            setDepartments(data);
        } catch (err) {
            console.error('Failed to load departments:', err);
        }
    };

    const loadSlots = async () => {
        try {
            const data = await fetchAvailableSlots({
                hospital_id: formData.hospital_id,
                department_id: formData.department_id,
            });
            setSlots(data);
        } catch (err) {
            console.error('Failed to load slots:', err);
        }
    };

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleBookAppointment = async () => {
        setLoading(true);
        try {
            const result = await bookAppointment(formData);
            setAppointment(result.appointment);
            handleNext();
        } catch (err) {
            alert('Failed to book appointment: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Initiate payment
            const paymentInit = await initiatePayment({
                appointment_id: appointment.id,
                gateway: 'test',
            });

            // Verify payment (test mode - always succeeds)
            const paymentVerify = await verifyPayment({
                transaction_id: paymentInit.transaction_id,
                test_mode: true,
                payment_method: 'test',
            });

            setPayment(paymentVerify);
            handleNext();
        } catch (err) {
            alert('Payment failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Hospital', icon: Building2 },
        { number: 2, title: 'Department', icon: Stethoscope },
        { number: 3, title: 'Time Slot', icon: Calendar },
        { number: 4, title: 'Details', icon: FileText },
        { number: 5, title: 'Payment', icon: CreditCard },
        { number: 6, title: 'Complete', icon: Check },
    ];

    const selectedHospital = hospitals.find(h => h.id === parseInt(formData.hospital_id));
    const selectedDepartment = departments.find(d => d.id === parseInt(formData.department_id));
    const selectedSlot = slots.find(s => s.id === parseInt(formData.appointment_slot_id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Book Appointment</h1>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <div key={s.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= s.number
                                            ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 hidden sm:block">{s.title}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-1 mx-2 transition-all ${step > s.number ? 'bg-teal-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {/* Step 1: Select Hospital */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Hospital</h2>
                            <div className="grid gap-4">
                                {hospitals.map((hospital) => (
                                    <button
                                        key={hospital.id}
                                        onClick={() => {
                                            setFormData({ ...formData, hospital_id: hospital.id, department_id: '', appointment_slot_id: '' });
                                            handleNext();
                                        }}
                                        className={`p-6 border-2 rounded-xl text-left transition-all ${formData.hospital_id === hospital.id
                                                ? 'border-teal-500 bg-teal-50'
                                                : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 text-lg">{hospital.name}</h3>
                                                <p className="text-sm text-gray-600">{hospital.address}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Select Department */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Department</h2>
                            <p className="text-gray-600 mb-6">at {selectedHospital?.name}</p>
                            <div className="grid gap-4">
                                {departments.map((dept) => (
                                    <button
                                        key={dept.id}
                                        onClick={() => {
                                            setFormData({ ...formData, department_id: dept.id, appointment_slot_id: '' });
                                            handleNext();
                                        }}
                                        className={`p-6 border-2 rounded-xl text-left transition-all ${formData.department_id === dept.id
                                                ? 'border-teal-500 bg-teal-50'
                                                : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                                                <Stethoscope className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 text-lg">{dept.name}</h3>
                                                {dept.description && <p className="text-sm text-gray-600">{dept.description}</p>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Select Time Slot */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Time Slot</h2>
                            <p className="text-gray-600 mb-6">{selectedDepartment?.name} at {selectedHospital?.name}</p>

                            {slots.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">No appointment slots available at this time.</p>
                                    <button onClick={handleBack} className="text-teal-600 hover:text-teal-700">
                                        Choose another department
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => {
                                                setFormData({ ...formData, appointment_slot_id: slot.id });
                                                handleNext();
                                            }}
                                            className={`p-4 border-2 rounded-xl text-left transition-all ${formData.appointment_slot_id === slot.id
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-600" />
                                                    <span className="font-medium text-gray-800">
                                                        {new Date(slot.start_time).toLocaleString()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(slot.end_time).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                    <p className="text-sm text-gray-500 mt-2">
                                        Or skip to book without specific slot
                                    </p>
                                    <button
                                        onClick={() => {
                                            setFormData({ ...formData, appointment_slot_id: '' });
                                            handleNext();
                                        }}
                                        className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-300 transition-all"
                                    >
                                        Continue without slot
                                    </button>
                                </div>
                            )}
                            <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </motion.div>
                    )}

                    {/* Step 4: Enter Details */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Appointment Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Symptoms / Reason for Visit *
                                    </label>
                                    <textarea
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        rows="4"
                                        placeholder="Describe your symptoms..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        rows="3"
                                        placeholder="Any additional information..."
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-600"><span className="font-medium">Hospital:</span> {selectedHospital?.name}</p>
                                        <p className="text-gray-600"><span className="font-medium">Department:</span> {selectedDepartment?.name}</p>
                                        {selectedSlot && (
                                            <p className="text-gray-600"><span className="font-medium">Time:</span> {new Date(selectedSlot.start_time).toLocaleString()}</p>
                                        )}
                                        <p className="text-gray-800 font-semibold text-lg mt-2">
                                            Consultation Fee: ₹{formData.payment_amount}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBookAppointment}
                                    disabled={loading || !formData.symptoms}
                                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Creating Appointment...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Payment
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <button onClick={handleBack} className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </motion.div>
                    )}

                    {/* Step 5: Payment */}
                    {step === 5 && appointment && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h2>

                            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-medium text-gray-800">Amount to Pay</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                        ₹{appointment.payment_amount}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Appointment ID: #{appointment.id}
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    🧪 <strong>Test Mode:</strong> This is a test payment. Click "Pay Now" to simulate a successful payment.
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pay Now (Test Mode)
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 6: Success */}
                    {step === 6 && payment && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-lg p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h2>
                            <p className="text-gray-600 mb-8">Your appointment has been successfully booked and paid.</p>

                            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                                <h3 className="font-semibold text-gray-800 mb-4">Appointment Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="font-medium">Appointment ID:</span> #{appointment.id}</p>
                                    <p className="text-gray-600"><span className="font-medium">Transaction ID:</span> {payment.payment.transaction_id}</p>
                                    <p className="text-gray-600"><span className="font-medium">Hospital:</span> {payment.appointment.hospital}</p>
                                    <p className="text-gray-600"><span className="font-medium">Status:</span> {payment.appointment.status}</p>
                                    <p className="text-gray-600"><span className="font-medium">Amount Paid:</span> ₹{payment.payment.amount}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/patient/my-appointments')}
                                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all"
                                >
                                    View My Appointments
                                </button>
                                <button
                                    onClick={() => navigate('/patient/dashboard')}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-teal-500 hover:text-teal-600 transition-all"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
