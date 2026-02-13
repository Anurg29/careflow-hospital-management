import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Stethoscope, FileText, CreditCard, Check, ArrowLeft, Loader, IndianRupee, Shield, CheckCircle } from 'lucide-react';
import { fetchHospitalsList, fetchDepartmentsList, bookAppointment, initiatePayment, verifyPayment } from '../api/client';

export default function BookAppointment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [appointment, setAppointment] = useState(null);
    
    const [formData, setFormData] = useState({
        hospital_id: '',
        department_id: '',
        symptoms: '',
        notes: '',
        payment_amount: 500,
    });

    useEffect(() => { loadHospitals(); }, []);
    useEffect(() => { if (formData.hospital_id) loadDepartments(); }, [formData.hospital_id]);

    const loadHospitals = async () => {
        try {
            setLoading(true);
            const data = await fetchHospitalsList();
            setHospitals(data);
        } catch (err) {
            setError('Failed to load hospitals');
        } finally {
            setLoading(false);
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

    const handleNext = () => { if (step < 5) setStep(step + 1); };
    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleCreateAppointment = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookAppointment({
                hospital_id: formData.hospital_id,
                department_id: formData.department_id || null,
                symptoms: formData.symptoms,
                notes: formData.notes,
                payment_amount: formData.payment_amount,
            });
            setAppointment(result.appointment);
            handleNext();
        } catch (err) {
            setError('Failed to create appointment: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const paymentData = await initiatePayment({ appointment_id: appointment.id, gateway: 'razorpay' });
            if (!window.Razorpay) { throw new Error('Razorpay SDK not loaded'); }
            const options = {
                key: paymentData.razorpay_key_id,
                amount: paymentData.amount * 100,
                currency: paymentData.currency || 'INR',
                name: 'CareFlow',
                description: 'Appointment at ' + (selectedHospital?.name || 'Hospital'),
                order_id: paymentData.razorpay_order_id,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            transaction_id: paymentData.transaction_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        handleNext();
                    } catch (err) { setError('Payment verification failed'); }
                    setLoading(false);
                },
                theme: { color: '#14b8a6' },
                modal: { ondismiss: function() { setLoading(false); setError('Payment cancelled'); } }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    const handleTestPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const paymentData = await initiatePayment({ appointment_id: appointment.id, gateway: 'test' });
            await verifyPayment({ transaction_id: paymentData.transaction_id, test_mode: true, payment_method: 'test_card' });
            handleNext();
        } catch (err) {
            setError(err.response?.data?.error || 'Test payment failed');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Hospital', icon: Building2 },
        { number: 2, title: 'Department', icon: Stethoscope },
        { number: 3, title: 'Details', icon: FileText },
        { number: 4, title: 'Payment', icon: CreditCard },
        { number: 5, title: 'Confirmed', icon: Check },
    ];

    const selectedHospital = hospitals.find(h => h.id === parseInt(formData.hospital_id));
    const selectedDepartment = departments.find(d => d.id === parseInt(formData.department_id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button onClick={() => navigate('/patient/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h1>
                    <p className="text-gray-600 mb-4">Secure online booking with instant confirmation</p>
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <div key={s.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.number ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 hidden sm:block">{s.title}</span>
                                </div>
                                {idx < steps.length - 1 && <div className={`w-8 sm:w-16 h-1 mx-1 ${step > s.number ? 'bg-teal-500' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</motion.div>}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Hospital</h2>
                            {loading ? <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-teal-500" /></div>
                            : hospitals.length === 0 ? <div className="text-center py-12"><Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-600">No hospitals available.</p></div>
                            : <div className="grid gap-4">{hospitals.map((h) => (
                                <button key={h.id} onClick={() => { setFormData({ ...formData, hospital_id: h.id, department_id: '' }); handleNext(); }} className="p-6 border-2 rounded-xl text-left border-gray-200 hover:border-teal-500 hover:bg-teal-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>
                                        <div><h3 className="font-semibold text-gray-800 text-lg">{h.name}</h3><p className="text-sm text-gray-600">{h.address}</p></div>
                                    </div>
                                </button>
                            ))}</div>}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Department</h2>
                            <p className="text-gray-600 mb-6">at {selectedHospital?.name}</p>
                            {departments.length === 0 ? <div className="text-center py-12"><Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-600 mb-4">No departments available.</p><button onClick={() => handleNext()} className="px-6 py-3 bg-teal-500 text-white rounded-lg">Continue with General</button></div>
                            : <div className="grid gap-4">{departments.map((d) => (
                                <button key={d.id} onClick={() => { setFormData({ ...formData, department_id: d.id }); handleNext(); }} className="p-6 border-2 rounded-xl text-left border-gray-200 hover:border-teal-500 hover:bg-teal-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center"><Stethoscope className="w-6 h-6 text-white" /></div>
                                        <div><h3 className="font-semibold text-gray-800 text-lg">{d.name}</h3>{d.description && <p className="text-sm text-gray-600">{d.description}</p>}</div>
                                    </div>
                                </button>
                            ))}</div>}
                            <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-gray-600"><ArrowLeft className="w-4 h-4" /> Back</button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Details</h2>
                            <p className="text-gray-600 mb-6">{selectedDepartment?.name || 'General'} at {selectedHospital?.name}</p>
                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 mb-6 border border-teal-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><IndianRupee className="w-6 h-6 text-teal-600" /><div><p className="font-semibold text-teal-800">Consultation Fee</p><p className="text-sm text-teal-600">Secure online payment</p></div></div>
                                    <p className="text-2xl font-bold text-teal-700">₹{formData.payment_amount}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Symptoms *</label><textarea value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="Describe your symptoms..." /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows={2} placeholder="Any allergies..." /></div>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <button onClick={handleBack} className="flex items-center gap-2 text-gray-600"><ArrowLeft className="w-4 h-4" /> Back</button>
                                <button onClick={handleCreateAppointment} disabled={loading || !formData.symptoms.trim()} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2">
                                    {loading ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</> : <><CreditCard className="w-5 h-5" /> Proceed to Payment</>}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Payment</h2>
                            <p className="text-gray-600 mb-6">Secure payment powered by Razorpay</p>
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-600">Hospital</span><span className="font-medium">{selectedHospital?.name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Department</span><span className="font-medium">{selectedDepartment?.name || 'General'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Appointment ID</span><span className="font-medium">#{appointment?.id}</span></div>
                                    <hr className="my-3" />
                                    <div className="flex justify-between text-lg"><span className="font-semibold">Total</span><span className="font-bold text-teal-600">₹{appointment?.payment_amount || formData.payment_amount}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Shield className="w-4 h-4" /><span>Secured with 256-bit SSL encryption</span></div>
                            <div className="space-y-3">
                                <button onClick={handleRazorpayPayment} disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-3">
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Pay ₹{appointment?.payment_amount || formData.payment_amount} with Razorpay</>}
                                </button>
                                <button onClick={handleTestPayment} disabled={loading} className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl disabled:opacity-50">Test Payment (Dev)</button>
                            </div>
                            <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-gray-600"><ArrowLeft className="w-4 h-4" /> Back</button>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-white" /></div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-8">Your appointment has been confirmed</p>
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-8 max-w-md mx-auto text-left">
                                <div className="space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-600">Appointment ID</span><span className="font-bold text-teal-600">#{appointment?.id}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Hospital</span><span className="font-medium">{selectedHospital?.name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Department</span><span className="font-medium">{selectedDepartment?.name || 'General'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Amount Paid</span><span className="font-bold text-green-600">₹{appointment?.payment_amount}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Confirmed</span></div>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => navigate('/patient/my-appointments')} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold">View Appointments</button>
                                <button onClick={() => navigate('/patient/dashboard')} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl">Dashboard</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
