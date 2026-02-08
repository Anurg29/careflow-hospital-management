import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  completeQueue,
  createBed,
  createHospital,
  createDepartment,
  createQueueEntry,
  fetchStatus,
  fetchQueue,
  fetchBeds,
  fetchHospitals,
  fetchDepartments,
  fetchAppointments,
  fetchDashboard,
  fetchPatientQueue,
  startQueue,
} from './api/client.js';
import { useHospitalSocket } from './api/useHospitalSocket.js';
import { Header } from './components/Header.jsx';
import { StatusBoard } from './components/StatusBoard.jsx';
import { DashboardCharts } from './components/DashboardCharts.jsx';
import { PatientPanel } from './components/PatientPanel.jsx';
import { QueuePanel } from './components/QueuePanel.jsx';
import { BedsPanel } from './components/BedsPanel.jsx';
import { FormsPanel } from './components/FormsPanel.jsx';
import { ActivityLog } from './components/ActivityLog.jsx';
import { useLogStore } from './store/useLogStore.js';
import useAuthStore from './store/useAuthStore.js';
import AuthPage from './components/AuthPage.jsx';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'queue', label: 'Patient Queue' },
  { id: 'beds', label: 'Beds' },
  { id: 'patient', label: 'Patient View' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'manage', label: 'Manage' },
];

export default function App() {
  const { authenticated, hydrate, forceLogout } = useAuthStore();

  // Hydrate user on mount (check existing token)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for forced logout from 401 interceptor
  useEffect(() => {
    const handler = () => {
      forceLogout();
      toast.error('Session expired — please sign in again');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [forceLogout]);

  if (!authenticated) return <AuthPage />;

  return <DashboardShell />;
}

function DashboardShell() {
  const [hospitalId, setHospitalId] = useState('');
  const [connectedId, setConnectedId] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [queueEntries, setQueueEntries] = useState([]);
  const [beds, setBeds] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [patientQueue, setPatientQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const { lines, push, clear } = useLogStore();

  // Load hospitals on mount
  useEffect(() => {
    fetchHospitals()
      .then(setHospitals)
      .catch(() => {});
  }, []);

  // Load data when hospital changes
  useEffect(() => {
    if (!hospitalId) return;
    const load = async () => {
      try {
        const [deps, q, b, a, d] = await Promise.all([
          fetchDepartments(hospitalId),
          fetchQueue(hospitalId),
          fetchBeds(hospitalId),
          fetchAppointments({ hospital: hospitalId, is_booked: false }),
          fetchDashboard(hospitalId),
        ]);
        setDepartments(deps);
        setQueueEntries(q);
        setBeds(b);
        setAppointments(a);
        setDashboard(d);
      } catch (err) {
        // silently fail for initial load
      }
    };
    load();
  }, [hospitalId]);

  const handleStatusMessage = useCallback(
    (payload) => {
      if (payload.type === 'status') {
        setSnapshot(payload);
        push('📡 Realtime update received');
      }
    },
    [push],
  );

  const handleWsStatus = useCallback(
    (status) => {
      push(`🔌 WebSocket: ${status}`);
    },
    [push],
  );

  const { status: wsStatus, refresh: wsRefresh } = useHospitalSocket(connectedId, {
    onMessage: handleStatusMessage,
    onStatus: handleWsStatus,
  });

  const refreshAll = useCallback(async () => {
    if (!hospitalId) return toast.error('Select a hospital first');
    setLoading(true);
    try {
      const [statusData, q, b, a, d] = await Promise.all([
        fetchStatus(hospitalId),
        fetchQueue(hospitalId),
        fetchBeds(hospitalId),
        fetchAppointments({ hospital: hospitalId, is_booked: false }),
        fetchDashboard(hospitalId),
      ]);
      setSnapshot(statusData);
      setQueueEntries(q);
      setBeds(b);
      setAppointments(a);
      setDashboard(d);
      push('🔄 Data refreshed');
      toast.success('Data refreshed');
    } catch (err) {
      push(`❌ Refresh failed: ${err.message}`);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId, push]);

  useEffect(() => {
    if (wsStatus === 'open') wsRefresh();
  }, [wsStatus, wsRefresh]);

  const connectWs = () => {
    if (!hospitalId) return toast.error('Enter a hospital ID first');
    setConnectedId(hospitalId.trim());
    push(`🏥 Connecting to hospital ${hospitalId}`);
    toast.success(`Connecting to hospital #${hospitalId}`);
  };

  const handleCreateHospital = async (payload) => {
    try {
      const data = await createHospital(payload);
      setHospitalId(String(data.id));
      setConnectedId(String(data.id));
      setHospitals((prev) => [...prev, data]);
      setSnapshot(null);
      push(`🏥 Hospital created: #${data.id}`);
      toast.success(`Hospital "${data.name}" created!`);
    } catch (err) {
      toast.error(err.message);
      push(`❌ Failed to create hospital: ${err.message}`);
    }
  };

  const handleCreateDepartment = async (payload) => {
    try {
      const data = await createDepartment(payload);
      setDepartments((prev) => [...prev, data]);
      push(`🏢 Department created: ${data.name}`);
      toast.success(`Department "${data.name}" created!`);
    } catch (err) {
      toast.error(err.message);
      push(`❌ Department error: ${err.message}`);
    }
  };

  const handleCreateQueue = async (body) => {
    try {
      const data = await createQueueEntry(body);
      push(`👤 Patient queued: #${data.id}`);
      toast.success('Patient added to queue!');
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
      push(`❌ Queue error: ${err.message}`);
    }
  };

  const handleStart = async (queueId) => {
    try {
      const data = await startQueue(queueId);
      push(`▶️ Visit started: #${data.id}`);
      toast.success('Visit started!');
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
      push(`❌ Start error: ${err.message}`);
    }
  };

  const handleComplete = async (queueId) => {
    try {
      const data = await completeQueue(queueId);
      push(`✅ Visit completed: #${data.id}`);
      toast.success('Visit completed!');
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
      push(`❌ Complete error: ${err.message}`);
    }
  };

  const handleBed = async (body) => {
    try {
      const data = await createBed(body);
      push(`🛏️ Bed saved: ${data.label}`);
      toast.success(`Bed "${data.label}" saved!`);
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
      push(`❌ Bed error: ${err.message}`);
    }
  };

  const handleLookupQueue = async (queueId) => {
    try {
      const data = await fetchPatientQueue(queueId);
      setPatientQueue(data);
      push(`👀 Patient checked queue #${queueId}`);
    } catch (err) {
      toast.error(err.message);
      push(`❌ Lookup error: ${err.message}`);
    }
  };

  const reloadAppointments = async () => {
    if (!hospitalId) return toast.error('Select a hospital first');
    try {
      const data = await fetchAppointments({ hospital: hospitalId, is_booked: false });
      setAppointments(data);
      push('📅 Appointments refreshed');
    } catch (err) {
      toast.error(err.message);
      push(`❌ Appointment fetch error: ${err.message}`);
    }
  };

  const reloadDashboard = async () => {
    if (!hospitalId) return toast.error('Select a hospital first');
    try {
      const data = await fetchDashboard(hospitalId);
      setDashboard(data);
      push('📊 Dashboard refreshed');
    } catch (err) {
      toast.error(err.message);
      push(`❌ Dashboard fetch error: ${err.message}`);
    }
  };

  return (
    <div className="app-shell">
      <Header
        wsStatus={wsStatus}
        hospitalId={hospitalId}
        hospitals={hospitals}
        onHospitalChange={setHospitalId}
        onRefresh={refreshAll}
        onConnect={connectWs}
        loading={loading}
      />

      {/* Tabs */}
      <div style={{ marginTop: 20 }}>
        <div className="tabs" style={{ display: 'inline-flex' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: 20 }}
        >
          {activeTab === 'dashboard' && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 360px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <StatusBoard snapshot={snapshot} hospitalId={hospitalId} />
                <QueuePanel
                  entries={queueEntries.filter((e) => e.status !== 'done')}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  compact
                />
                <DashboardCharts metrics={dashboard} />
              </div>
              <ActivityLog lines={lines} onClear={clear} />
            </div>
          )}

          {activeTab === 'queue' && (
            <QueuePanel entries={queueEntries} onStart={handleStart} onComplete={handleComplete} />
          )}

          {activeTab === 'beds' && <BedsPanel beds={beds} />}

          {activeTab === 'patient' && (
            <PatientPanel
              onLookupQueue={handleLookupQueue}
              queueResult={patientQueue}
              appointments={appointments}
              onReloadAppointments={reloadAppointments}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
              <DashboardCharts metrics={dashboard} />
              <ActivityLog lines={lines} onClear={clear} />
              <button className="btn btn-ghost" onClick={reloadDashboard} style={{ justifySelf: 'start' }}>
                Refresh analytics
              </button>
            </div>
          )}

          {activeTab === 'manage' && (
            <FormsPanel
              hospitalId={hospitalId}
              departments={departments}
              onCreateHospital={handleCreateHospital}
              onCreateDepartment={handleCreateDepartment}
              onCreateQueue={handleCreateQueue}
              onStart={handleStart}
              onComplete={handleComplete}
              onBed={handleBed}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
