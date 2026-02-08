import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Trash2 } from 'lucide-react';

export function ActivityLog({ lines, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScrollText size={18} style={{ color: 'var(--accent)' }} />
          <h3>Activity Log</h3>
          <span className="badge badge-accent" style={{ fontSize: 11 }}>{lines.length}</span>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onClear} title="Clear log">
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      <div className="log-box" style={{ flex: 1 }}>
        {lines.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            No activity yet. Actions will appear here.
          </div>
        ) : (
          <AnimatePresence>
            {lines.map((l, idx) => (
              <motion.div
                key={idx}
                className="log-line"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                {l}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
