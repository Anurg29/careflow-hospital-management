import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export function DashboardCharts({ metrics }) {
  if (!metrics) {
    return (
      <div className="card">
        <h3>Admin dashboard</h3>
        <p className="subtle">Connect to a hospital to see charts.</p>
      </div>
    );
  }

  const throughputData = (metrics.throughput || []).map((pt) => ({
    hour: new Date(pt.hour).toLocaleTimeString([], { hour: 'numeric' }),
    completed: pt.completed,
  }));

  const bedData = Object.entries(metrics.beds || {}).map(([name, count]) => ({ name, count }));
  const queueData = Object.entries(metrics.queue || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="card" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Admin dashboard</h3>
        <span className="subtle">Predicted wait: {metrics.predicted_wait_minutes} min</span>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <AreaChart data={throughputData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1ee0e0" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#1ee0e0" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="#9bb0cc" />
            <YAxis allowDecimals={false} stroke="#9bb0cc" />
            <Tooltip contentStyle={{ background: '#0f182d', border: '1px solid #24324d' }} />
            <Area type="monotone" dataKey="completed" stroke="#1ee0e0" fill="url(#colorComp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16 }}>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={bedData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#9bb0cc" interval={0} angle={-10} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} stroke="#9bb0cc" />
              <Tooltip contentStyle={{ background: '#0f182d', border: '1px solid #24324d' }} />
              <Legend />
              <Bar dataKey="count" fill="#1ee0e0" radius={[6, 6, 0, 0]} name="Beds" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={queueData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#9bb0cc" interval={0} angle={-10} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} stroke="#9bb0cc" />
              <Tooltip contentStyle={{ background: '#0f182d', border: '1px solid #24324d' }} />
              <Legend />
              <Bar dataKey="count" fill="#7cf29c" radius={[6, 6, 0, 0]} name="Queue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
