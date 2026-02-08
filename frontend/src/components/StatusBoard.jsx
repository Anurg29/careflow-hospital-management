import React from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble,
  BedSingle,
  Clock,
  Users,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';

const stats = [
  {
    key: 'available_beds',
    label: 'Beds Available',
    icon: BedDouble,
    color: 'var(--green)',
    bg: 'var(--green-soft)',
    cardClass: 'green',
  },
  {
    key: 'occupied_beds',
    label: 'Beds Occupied',
    icon: BedSingle,
    color: 'var(--red)',
    bg: 'var(--red-soft)',
    cardClass: 'red',
  },
  {
    key: 'waiting_patients',
    label: 'Waiting',
    icon: Users,
    color: 'var(--amber)',
    bg: 'var(--amber-soft)',
    cardClass: 'amber',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: Stethoscope,
    color: 'var(--accent)',
    bg: 'var(--accent-soft)',
    cardClass: 'accent',
  },
  {
    key: 'predicted_wait_minutes',
    label: 'Est. Wait (min)',
    icon: Clock,
    color: 'var(--purple)',
    bg: 'var(--purple-soft)',
    cardClass: 'purple',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export function StatusBoard({ snapshot, hospitalId }) {
  if (!snapshot) {
    return (
      <div className="card">
        <div className="empty-state">
          <TrendingUp size={48} strokeWidth={1.2} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ marginTop: 12, color: 'var(--text-secondary)' }}>No Data Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {hospitalId ? 'Click Refresh to load live status' : 'Select a hospital to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Live Status</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            Hospital #{snapshot.hospital_id} • Last update:{' '}
            {snapshot.last_updated ? new Date(snapshot.last_updated).toLocaleTimeString() : '—'}
          </p>
        </div>
        <span className="badge badge-green">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Live
        </span>
      </div>

      <motion.div
        className="grid grid-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          const val = snapshot[s.key];
          return (
            <motion.div key={s.key} className={`stat-card ${s.cardClass}`} variants={item}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={22} style={{ color: s.color }} />
              </div>
              <div className="stat-value" style={{ color: s.color }}>{val ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
