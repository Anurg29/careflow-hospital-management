import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Stethoscope, FileText, Users, Check, ArrowLeft, Loader, Clock, Hash } from 'lucide-react';
import { fetchHospitalsList, fetchDepartmentsList, joinQueue } from '../api/client';

export default function BookAppointment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        hospital_id: '',
        department_id: '',
        patient_name: '',
        symptoms: '',
        notes: '',
    });
    const [queueEntry, setQueueEntry] = useState(null);

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

    const handleNext = () => { if (step < 4) setStep(step + 1); };
    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleJoinQueue = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await joinQueue({
                hospital: formData.hospital_id,
                department: formData.department_id,
                patient_name: formData.patient_name,
                symptoms: formData.symptoms,
                notes: formData.notes,
            });
            setQueueEntry(result);
            handleNext();
        } catch (err) {
            setError('Failed to join queue: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Hospital', icon: Building2 },
        { number: 2, title: 'Department', icon: Stethoscope },
        { number: 3, title: 'Details', icon: FileText },
        { number: 4, title: 'Complete', icon: Check },
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
                    <p className="text-gray-600 mb-4">First-Come-First-Serve Queue System</p>
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <div key={s.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.number ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > s.number ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs mt-1 text-gray-600 hidden sm:block">{s.title}</span>
                                </div>
                                {idx < steps.length - 1 && <div className={`w-12 sm:w-24 h-1 mx-2 ${step > s.number ? 'bg-teal-500' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Hospital</h2>
                            {loading ? (
                                <div className="flex items-center justify-center py-12"><Loader className="w-8 h-8 animate-spin text-teal-500" /></div>
                            ) : hospitals.length === 0 ? (
                                <div className="text-center py-12"><Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-600">No hospitals available.</p></div>
                            ) : (
                                <div className="grid gap-4">
                                    {hospitals.map((hospital) => (
                                        <button key={hospital.id} onClick={() => { setFormData({ ...formData, hospital_id: hospital.id, department_id: '' }); handleNext(); }} className="p-6 border-2 rounded-xl text-left border-gray-200 hover:border-teal-500 hover:bg-teal-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>
                                                <div><h3 className="font-semibold text-gray-800 text-lg">{hospital.name}</h3><p className="text-sm text-gray-600">{hospital.address}</p></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Department</h2>
                            <p className="text-gray-600 mb-6">at {selectedHospital?.name}</p>
                            {departments.length === 0 ? (
                                <div className="text-center py-12"><Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-600">No departments available.</p></div>
                            ) : (
                                <div className="grid gap-4">
                                    {departments.map((dept) => (
                                        <button key={dept.id} onClick={() => { setFormData({ ...formData, department_id: dept.id }); handleNext(); }} className="p-6 border-2 rounded-xl text-left border-gray-200 hover:border-teal-500 hover:bg-teal-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center"><Stethoscope className="w-6 h-6 text-white" /></div>
                                                <div><h3 className="font-semibold text-gray-800 text-lg">{dept.name}</h3>{dept.description && <p className="text-sm text-gray-600">{dept.description}</p>}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button onClick={handleBack} className="mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"><ArrowLeft className="w-4 h-4" /> Back</button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Your Details</h2>
                            <p className="text-gray-600 mb-6">{selectedDepartment?.name} at {selectedHospital?.name}</p>
                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 mb-6 border border-teal-100">
                                <div className="flex items-center gap-3"><Users className="w-6 h-6 text-teal-600" /><div><p className="font-semibold text-teal-800">First-Come-First-Serve Queue</p><p className="text-sm text-teal-600">You will be served in order of arrival</p></div></div>
                            </div>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label><input type="text" value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter your full name" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Symptoms *</label><textarea value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="Describe your symptoms..." /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" rows={2} placeholder="Any allergies..." /></div>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <button onClick={handleBack} className="flex items-center gap-2 text-gray-600"><ArrowLeft className="w-4 h-4" /> Back</button>
                                <button onClick={handleJoinQueue} disabled={loading || !formData.patient_name.trim() || !formData.symptoms.trim()} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2">
                                    {loading ? <><Loader className="w-5 h-5 animate-spin" /> Joining...</> : <><Users className="w-5 h-5" /> Join Queue</>}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-white" /></div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">You are in the Queue!</h2>
                            <p className="text-gray-600 mb-8">Your appointment has been confirmed</p>
                            {queueEntry && (
                                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className="bg-white rounded-lg p-4 shadow-sm"><div className="flex items-center gap-2 mb-1"><Hash className="w-4 h-4 text-teal-600" /><span className="text-sm text-gray-600">Token</span></div><p className="text-2xl font-bold text-teal-600">#{queueEntry.id}</p></div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm"><div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-600">Wait</span></div><p className="text-2xl font-bold text-blue-600">~15 min</p></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t text-left text-sm text-gray-600">
                                        <p><strong>Patient:</strong> {queueEntry.patient_name}</p>
                                        <p><strong>Hospital:</strong> {selectedHospital?.name}</p>
                                        <p><strong>Department:</strong> {selectedDepartment?.name}</p>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => navigate('/patient/dashboard')} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold">Go to Dashboard</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
