import React, { useState } from 'react';

export function PatientPanel({ onLookupQueue, queueResult, appointments, onReloadAppointments }) {
  const [queueId, setQueueId] = useState('');

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge">Patient view</div>
            <h3>Your queue status</h3>
            <p className="subtle">Enter the queue ID shared by registration to see your ETA.</p>
          </div>
        </div>
        <form
          style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!queueId) return;
            onLookupQueue(queueId);
          }}
        >
          <input
            style={{ flex: '1 1 200px' }}
            placeholder="Queue ID"
            value={queueId}
            onChange={(e) => setQueueId(e.target.value)}
          />
          <button type="submit">Check status</button>
        </form>

        <div style={{ marginTop: 14 }}>
          {queueResult ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              <Info label="Patient" value={queueResult.patient_name} />
              <Info label="Status" value={queueResult.status} />
              <Info label="Predicted wait (min)" value={queueResult.predicted_wait_minutes ?? '—'} accent />
              <Info
                label="Expected finish"
                value={queueResult.expected_finish ? new Date(queueResult.expected_finish).toLocaleTimeString() : '—'}
              />
              <Info
                label="Arrival"
                value={queueResult.arrival_time ? new Date(queueResult.arrival_time).toLocaleTimeString() : '—'}
              />
            </div>
          ) : (
            <p className="subtle" style={{ marginTop: 8 }}>
              No queue selected yet.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge">Appointments</div>
            <h3>Upcoming slots</h3>
            <p className="subtle">Available and booked slots for this hospital.</p>
          </div>
          <button className="secondary" style={{ padding: '6px 10px' }} onClick={onReloadAppointments}>
            Refresh
          </button>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {(appointments || []).slice(0, 6).map((slot) => (
            <div
              key={slot.id}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: slot.is_booked ? 'rgba(255,107,107,0.08)' : 'rgba(124,242,156,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>
                  {new Date(slot.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                  {new Date(slot.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </strong>
                <span className="subtle">{slot.department || 'General'}</span>
              </div>
              <div className="subtle">{slot.is_booked ? `Booked for ${slot.patient_name || 'N/A'}` : 'Available'}</div>
            </div>
          ))}
          {appointments && appointments.length === 0 && <p className="subtle">No slots found.</p>}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, accent }) {
  return (
    <div className="stat" style={accent ? { boxShadow: '0 10px 36px rgba(30,224,224,0.12)' } : undefined}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="value" style={accent ? { color: 'var(--accent)' } : undefined}>{value ?? '—'}</div>
    </div>
  );
}
