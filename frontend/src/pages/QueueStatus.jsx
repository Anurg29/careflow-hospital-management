import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Clock, Activity } from 'lucide-react';
import { fetchHospitalsList, fetchQueueStatus } from '../api/client';

export default function QueueStatus() {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            const data = await fetchHospitalsList();
            setHospitals(data);
        } catch (err) {
            console.error('Failed to load hospitals:', err);
        }
    };

    const loadQueueStatus = async (hospitalId) => {
        setLoading(true);
        try {
            const data = await fetchQueueStatus(hospitalId);
            setQueueData(data);
        } catch (err) {
            console.error('Failed to load queue status:', err);
            alert('Failed to load queue status');
        } finally {
            setLoading(false);
        }
    };

    const handleHospitalSelect = (hospitalId) => {
        setSelectedHospital(hospitalId);
        loadQueueStatus(hospitalId);
    };

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
                    <h1 className="text-2xl font-bold text-gray-800">Queue Status</h1>
                    <p className="text-gray-600">Check real-time wait times</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Hospital Selection */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Select Hospital</h2>
                    <div className="grid gap-3">
                        {hospitals.map((hospital) => (
                            <button
                                key={hospital.id}
                                onClick={() => handleHospitalSelect(hospital.id)}
                                className={`p-4 border-2 rounded-xl text-left transition-all ${selectedHospital === hospital.id
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-teal-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                                        <p className="text-sm text-gray-600">{hospital.address}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Queue Status Display */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading queue status...</p>
                    </div>
                )}

                {queueData && !loading && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    <h3 className="font-semibold text-gray-800">Waiting</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{queueData.queue_status.total_waiting}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-6 h-6 text-purple-600" />
                                    <h3 className="font-semibold text-gray-800">In Progress</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{queueData.queue_status.in_progress}</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-6 h-6 text-teal-600" />
                                    <h3 className="font-semibold text-gray-800">Est. Wait</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{queueData.queue_status.estimated_wait_minutes} min</p>
                            </div>
                        </div>

                        {/* Current Queue */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Current Queue</h2>
                            {queueData.current_queue.length === 0 ? (
                                <p className="text-center py-8 text-gray-600">No one in queue</p>
                            ) : (
                                <div className="space-y-3">
                                    {queueData.current_queue.map((entry) => (
                                        <div
                                            key={entry.position}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-600">
                                                    {entry.position}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{entry.patient_name}</p>
                                                    <p className="text-sm text-gray-600">{entry.status}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(entry.arrival_time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
