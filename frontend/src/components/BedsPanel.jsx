import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble,
  CheckCircle2,
  User,
  Wrench,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

const statusConfig = {
  available: { label: 'Available', color: 'var(--green)', bg: 'var(--green-soft)', icon: CheckCircle2 },
  occupied: { label: 'Occupied', color: 'var(--red)', bg: 'var(--red-soft)', icon: User },
  cleaning: { label: 'Cleaning', color: 'var(--amber)', bg: 'var(--amber-soft)', icon: Sparkles },
  maintenance: { label: 'Maintenance', color: 'var(--purple)', bg: 'var(--purple-soft)', icon: Wrench },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export function BedsPanel({ beds = [] }) {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');

  const filtered = beds.filter((b) => filter === 'all' || b.status === filter);

  const counts = {
    all: beds.length,
    available: beds.filter((b) => b.status === 'available').length,
    occupied: beds.filter((b) => b.status === 'occupied').length,
    cleaning: beds.filter((b) => b.status === 'cleaning').length,
    maintenance: beds.filter((b) => b.status === 'maintenance').length,
  };

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BedDouble size={20} style={{ color: 'var(--accent)' }} />
          <h2>Beds Overview</h2>
          <span className="badge badge-accent">{beds.length} total</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`btn btn-sm btn-icon ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`btn btn-sm btn-icon ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter((f) => (f === key ? 'all' : key))}
              style={filter === key ? {} : { borderColor: cfg.color + '40' }}
            >
              <Icon size={14} style={filter !== key ? { color: cfg.color } : {}} />
              {cfg.label}
              <span style={{
                fontSize: 11,
                opacity: 0.8,
                background: 'rgba(255,255,255,0.1)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <BedDouble size={48} strokeWidth={1.2} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>No beds found</p>
        </div>
      ) : view === 'grid' ? (
        <motion.div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filtered.map((bed) => {
            const cfg = statusConfig[bed.status] || statusConfig.available;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={bed.id}
                className={`bed-item ${bed.status}`}
                variants={item}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: cfg.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>
                  <span className={`badge ${cfg.color === 'var(--green)' ? 'badge-green' : cfg.color === 'var(--red)' ? 'badge-red' : cfg.color === 'var(--amber)' ? 'badge-amber' : 'badge-purple'}`}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{bed.label}</div>
                {bed.patient_name && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={12} /> {bed.patient_name}
                  </div>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6 }}>
                  Updated: {bed.updated_at ? new Date(bed.updated_at).toLocaleTimeString() : '—'}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((bed) => {
            const cfg = statusConfig[bed.status] || statusConfig.available;
            const Icon = cfg.icon;
            return (
              <div
                key={bed.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.12)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: cfg.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>
                <div style={{ fontWeight: 600, minWidth: 80 }}>{bed.label}</div>
                <span className={`badge ${cfg.color === 'var(--green)' ? 'badge-green' : cfg.color === 'var(--red)' ? 'badge-red' : cfg.color === 'var(--amber)' ? 'badge-amber' : 'badge-purple'}`}>
                  {cfg.label}
                </span>
                {bed.patient_name && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 'auto' }}>
                    <User size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                    {bed.patient_name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
