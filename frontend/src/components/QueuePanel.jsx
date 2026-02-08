import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  User,
} from 'lucide-react';

const statusConfig = {
  waiting: { label: 'Waiting', badge: 'badge-amber', icon: Clock, color: 'var(--amber)' },
  in_progress: { label: 'In Progress', badge: 'badge-accent', icon: Play, color: 'var(--accent)' },
  done: { label: 'Done', badge: 'badge-green', icon: CheckCircle2, color: 'var(--green)' },
  cancelled: { label: 'Cancelled', badge: 'badge-red', icon: AlertCircle, color: 'var(--red)' },
};

export function QueuePanel({ entries = [], onStart, onComplete, compact = false }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = entries.filter((e) => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (search && !e.patient_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: entries.length,
    waiting: entries.filter((e) => e.status === 'waiting').length,
    in_progress: entries.filter((e) => e.status === 'in_progress').length,
    done: entries.filter((e) => e.status === 'done').length,
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={20} style={{ color: 'var(--accent)' }} />
          <h2>Patient Queue</h2>
          <span className="badge badge-accent">{entries.length}</span>
        </div>
      </div>

      {!compact && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'waiting', label: 'Waiting' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'done', label: 'Done' },
            ].map((f) => (
              <button
                key={f.id}
                className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span style={{
                  marginLeft: 4,
                  fontSize: 11,
                  opacity: 0.7,
                  background: 'rgba(255,255,255,0.15)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {counts[f.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </>
      )}

      {/* Queue List */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: compact ? '24px 16px' : undefined }}>
          <Users size={36} strokeWidth={1.2} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>No patients in queue</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {filtered.slice(0, compact ? 5 : undefined).map((entry) => {
              const cfg = statusConfig[entry.status] || statusConfig.waiting;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: cfg.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={18} style={{ color: cfg.color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.patient_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                      #{entry.id} • {entry.arrival_time ? new Date(entry.arrival_time).toLocaleTimeString() : '—'}
                      {entry.symptoms && ` • ${entry.symptoms.substring(0, 40)}${entry.symptoms.length > 40 ? '...' : ''}`}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`badge ${cfg.badge}`} style={{ flexShrink: 0 }}>
                    <Icon size={12} />
                    {cfg.label}
                  </span>

                  {/* Actions */}
                  {entry.status === 'waiting' && onStart && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onStart(entry.id)}
                      title="Start visit"
                    >
                      <Play size={14} />
                      Start
                    </button>
                  )}
                  {entry.status === 'in_progress' && onComplete && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => onComplete(entry.id)}
                      title="Complete visit"
                    >
                      <CheckCircle2 size={14} />
                      Done
                    </button>
                  )}

                  {/* Wait time */}
                  {entry.predicted_wait_minutes != null && entry.status === 'waiting' && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>
                        ~{entry.predicted_wait_minutes}m
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>wait</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {compact && filtered.length > 5 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
              +{filtered.length - 5} more patients…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
