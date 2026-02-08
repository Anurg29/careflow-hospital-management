import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hospital,
  Building2,
  UserPlus,
  Play,
  CheckCircle2,
  BedDouble,
  Plus,
} from 'lucide-react';

export function FormsPanel({
  hospitalId,
  departments = [],
  onCreateHospital,
  onCreateDepartment,
  onCreateQueue,
  onStart,
  onComplete,
  onBed,
}) {
  return (
    <motion.div
      className="grid grid-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Create Hospital */}
      <FormCard
        icon={Hospital}
        title="New Hospital"
        subtitle="Register a new hospital"
        color="var(--accent)"
      >
        <SmartForm
          fields={[
            { name: 'name', label: 'Hospital Name', placeholder: 'e.g. City General Hospital', required: true },
            { name: 'address', label: 'Address', placeholder: 'Full address (optional)', textarea: true },
          ]}
          submitLabel="Create Hospital"
          onSubmit={onCreateHospital}
          submitClass="btn-primary"
          icon={Plus}
        />
      </FormCard>

      {/* Create Department */}
      <FormCard
        icon={Building2}
        title="New Department"
        subtitle="Add a department to current hospital"
        color="var(--purple)"
      >
        <SmartForm
          fields={[
            { name: 'name', label: 'Department Name', placeholder: 'e.g. Cardiology', required: true },
            { name: 'description', label: 'Description', placeholder: 'Brief description (optional)', textarea: true },
          ]}
          submitLabel="Create Department"
          onSubmit={(data) => onCreateDepartment({ hospital: Number(hospitalId), ...data })}
          submitClass="btn-primary"
          icon={Plus}
          disabled={!hospitalId}
          disabledMsg="Select a hospital first"
        />
      </FormCard>

      {/* Add Patient to Queue */}
      <FormCard
        icon={UserPlus}
        title="Add to Queue"
        subtitle="Register a new patient visit"
        color="var(--green)"
      >
        <SmartForm
          fields={[
            { name: 'patient_name', label: 'Patient Name', placeholder: 'Full name', required: true },
            {
              name: 'department',
              label: 'Department',
              select: true,
              options: [
                { value: '', label: 'General (No department)' },
                ...departments.map((d) => ({ value: String(d.id), label: d.name })),
              ],
            },
            { name: 'symptoms', label: 'Symptoms / Notes', placeholder: 'Describe symptoms...', textarea: true },
          ]}
          submitLabel="Add Patient"
          onSubmit={(data) =>
            onCreateQueue({
              hospital: Number(hospitalId),
              patient_name: data.patient_name,
              department: data.department ? Number(data.department) : null,
              symptoms: data.symptoms,
            })
          }
          submitClass="btn-success"
          icon={UserPlus}
          disabled={!hospitalId}
          disabledMsg="Select a hospital first"
        />
      </FormCard>

      {/* Manage Visit */}
      <FormCard
        icon={Play}
        title="Manage Visit"
        subtitle="Start or complete a patient visit"
        color="var(--amber)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Play size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Start Visit</span>
            </div>
            <SmartForm
              fields={[{ name: 'queueId', label: '', placeholder: 'Queue entry ID', required: true, type: 'number' }]}
              submitLabel="Start Visit"
              onSubmit={(data) => onStart(data.queueId)}
              submitClass="btn-primary"
              icon={Play}
              inline
            />
          </div>

          <div className="divider" />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Complete Visit</span>
            </div>
            <SmartForm
              fields={[{ name: 'queueId', label: '', placeholder: 'Queue entry ID', required: true, type: 'number' }]}
              submitLabel="Complete"
              onSubmit={(data) => onComplete(data.queueId)}
              submitClass="btn-success"
              icon={CheckCircle2}
              inline
            />
          </div>
        </div>
      </FormCard>

      {/* Add Bed */}
      <FormCard
        icon={BedDouble}
        title="Add / Update Bed"
        subtitle="Manage bed inventory"
        color="var(--blue)"
      >
        <SmartForm
          fields={[
            { name: 'label', label: 'Bed Label', placeholder: 'e.g. ICU-01', required: true },
            {
              name: 'department',
              label: 'Department',
              select: true,
              options: [
                { value: '', label: 'General' },
                ...departments.map((d) => ({ value: String(d.id), label: d.name })),
              ],
            },
            { name: 'patient_name', label: 'Patient Name', placeholder: 'If occupied' },
            {
              name: 'status',
              label: 'Status',
              select: true,
              options: [
                { value: 'available', label: '🟢 Available' },
                { value: 'occupied', label: '🔴 Occupied' },
                { value: 'cleaning', label: '🟡 Cleaning' },
                { value: 'maintenance', label: '🟣 Maintenance' },
              ],
            },
          ]}
          submitLabel="Save Bed"
          onSubmit={(data) =>
            onBed({
              hospital: Number(hospitalId),
              label: data.label,
              department: data.department ? Number(data.department) : null,
              patient_name: data.patient_name,
              status: data.status || 'available',
            })
          }
          submitClass="btn-primary"
          icon={BedDouble}
          disabled={!hospitalId}
          disabledMsg="Select a hospital first"
        />
      </FormCard>
    </motion.div>
  );
}

/* ─── Reusable Form Card Wrapper ─── */
function FormCard({ icon: Icon, title, subtitle, color, children }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: color + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <h3>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Smart Form Component ─── */
function SmartForm({ fields, onSubmit, submitLabel, submitClass = 'btn-primary', icon: BtnIcon, disabled, disabledMsg, inline }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    try {
      await onSubmit(body);
      e.target.reset();
    } finally {
      setSubmitting(false);
    }
  };

  if (disabled) {
    return (
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(0,0,0,0.15)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        {disabledMsg}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={inline ? { flexDirection: 'row', display: 'flex', gap: 8, alignItems: 'stretch' } : undefined}>
      {fields.map((field) => {
        if (field.select) {
          return (
            <div key={field.name} className="input-group" style={inline ? { flex: 1 } : undefined}>
              {field.label && <label className="input-label">{field.label}</label>}
              <select name={field.name} defaultValue={field.options?.[0]?.value} required={field.required}>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          );
        }
        if (field.textarea) {
          return (
            <div key={field.name} className="input-group">
              {field.label && <label className="input-label">{field.label}</label>}
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                rows={2}
                required={field.required}
              />
            </div>
          );
        }
        return (
          <div key={field.name} className="input-group" style={inline ? { flex: 1 } : undefined}>
            {field.label && <label className="input-label">{field.label}</label>}
            <input
              name={field.name}
              placeholder={field.placeholder}
              type={field.type || 'text'}
              required={field.required}
            />
          </div>
        );
      })}
      <button
        type="submit"
        className={`btn ${submitClass}`}
        disabled={submitting}
        style={inline ? { alignSelf: 'flex-end' } : {}}
      >
        {BtnIcon && <BtnIcon size={16} />}
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
