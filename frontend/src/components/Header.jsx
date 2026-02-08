import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Hospital,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  LogOut,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export function Header({ wsStatus, hospitalId, hospitals, onHospitalChange, onRefresh, onConnect, loading }) {
  const { user, logout } = useAuthStore();
  const statusMap = {
    idle: { color: 'var(--text-muted)', label: 'Disconnected', icon: WifiOff },
    connecting: { color: 'var(--amber)', label: 'Connecting...', icon: Loader2 },
    open: { color: 'var(--green)', label: 'Connected', icon: Wifi },
    closed: { color: 'var(--red)', label: 'Disconnected', icon: WifiOff },
    error: { color: 'var(--red)', label: 'Error', icon: WifiOff },
  };

  const ws = statusMap[wsStatus] || statusMap.idle;
  const StatusIcon = ws.icon;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
        borderColor: 'rgba(6, 182, 212, 0.15)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px var(--accent-glow)',
          }}>
            <Activity size={26} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>
              CareFlow
              <span style={{ color: 'var(--accent)', marginLeft: 6 }}>Live</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>
              Smart Hospital Queue Management
            </p>
          </div>
        </div>

        {/* User Badge & Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div className="user-badge">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user.username}</span>
              <button className="btn-logout" onClick={logout} title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
            <StatusIcon
              size={14}
              style={{ color: ws.color }}
              className={wsStatus === 'connecting' ? 'spin' : ''}
            />
            <span style={{ fontSize: 13, color: ws.color, fontWeight: 500 }}>{ws.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Hospital size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {hospitals && hospitals.length > 0 ? (
            <select
              value={hospitalId}
              onChange={(e) => onHospitalChange(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} (#{h.id})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              placeholder="Hospital ID"
              value={hospitalId || ''}
              onChange={(e) => onHospitalChange(e.target.value)}
              style={{ flex: 1, maxWidth: 200 }}
            />
          )}
        </div>

        <button className="btn btn-primary" onClick={onConnect} disabled={!hospitalId}>
          <Wifi size={16} />
          Connect
        </button>

        <button className="btn btn-ghost" onClick={onRefresh} disabled={!hospitalId || loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>
    </motion.div>
  );
}
