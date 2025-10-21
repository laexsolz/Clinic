// components/admin/panels/DashboardPanel.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, Activity, Settings, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
// import { supabase } from '../../../lib/supabase'; // uncomment when integrating

type Metric = { id: string; label: string; value: string; icon?: React.ReactNode; color?: string };

const demoMetrics: Metric[] = [
  { id: 'patients', label: 'Total Patients', value: '156', icon: <Users className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50' },
  { id: 'health', label: 'System Health', value: '89%', icon: <Activity className="w-5 h-5 text-green-600" />, color: 'bg-green-50' },
  { id: 'doctors', label: 'Active Doctors', value: '4', icon: <Users className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
];

const demoTimeseries = [
  { date: 'Oct 14', appointments: 8 },
  { date: 'Oct 15', appointments: 12 },
  { date: 'Oct 16', appointments: 6 },
  { date: 'Oct 17', appointments: 10 },
  { date: 'Oct 18', appointments: 14 },
  { date: 'Oct 19', appointments: 9 },
  { date: 'Oct 20', appointments: 11 },
];

const demoStatus = [
  { name: 'Pending', value: 8, color: '#f59e0b' }, // amber
  { name: 'Confirmed', value: 22, color: '#10b981' }, // green
  { name: 'Cancelled', value: 3, color: '#ef4444' }, // red
];

const demoAppointments = [
  { id: 'a1', patient: 'John Doe', doctor: 'Dr. Sara Khan', date: 'Oct 22, 2025 — 10:00 AM', status: 'Pending' },
  { id: 'a2', patient: 'Mary Ali', doctor: 'Dr. Ahmed Malik', date: 'Oct 23, 2025 — 11:30 AM', status: 'Confirmed' },
  { id: 'a3', patient: 'Ali Rehman', doctor: 'Dr. Sara Khan', date: 'Oct 24, 2025 — 09:00 AM', status: 'Confirmed' },
];

export default function DashboardPanel() {
  const [metrics, setMetrics] = useState<Metric[]>(demoMetrics);
  const [timeseries, setTimeseries] = useState(demoTimeseries);
  const [status, setStatus] = useState(demoStatus);
  const [appointments, setAppointments] = useState(demoAppointments);

  // --- Example: how you'd fetch data from Supabase (uncomment and adapt)
  /*
  useEffect(() => {
    async function loadData() {
      // 1) total users
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact' });

      // 2) appointments per day (example)
      const { data: appts } = await supabase.rpc('appointments_per_day', { /* args if any *\/ });

      // 3) appointment status counts
      const { data: statusCounts } = await supabase
        .from('appointments')
        .select('status, count', { count: 'exact' }) // or use aggregate rpc

      // set state accordingly...
    }
    loadData();
  }, []);
  */

  // memoized formatted values for charts (no heavy work here)
  const totalUsers = useMemo(() => metrics.find((m) => m.id === 'users')?.value ?? '—', [metrics]);

  return (
    <div className="space-y-6">
      {/* metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${m.color} p-2 rounded-md`}>{m.icon}</div>
                <div>
                  <div className="text-xs text-slate-500">{m.label}</div>
                  <div className="text-2xl font-semibold text-slate-800">{m.value}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400"> {/* small sparkline placeholder */} </div>
            </div>
            <div className="mt-3 text-xs text-slate-500"> {/* extra info if needed */} </div>
          </motion.div>
        ))}
      </div>

      {/* charts row */}
     {/* responsive charts row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* appointments timeseries */}
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base md:text-lg font-semibold text-slate-800">Appointments (last 7 days)</h3>
        <p className="text-xs md:text-sm text-slate-500">Trends of scheduled appointments</p>
      </div>
      <div className="text-xs md:text-sm text-slate-500">
        Total: {timeseries.reduce((s, d) => s + d.appointments, 0)}
      </div>
    </div>

    {/* chart wrapper: smaller height on mobile, prevent focus outline on click */}
    <div
      className="mt-3 h-44 md:h-56 w-full focus:outline-none"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timeseries}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* pie / status */}
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base md:text-lg font-semibold text-slate-800">Appointment Status</h3>
        <p className="text-xs md:text-sm text-slate-500">Overview of current appointment statuses</p>
      </div>
      <div className="text-xs md:text-sm text-slate-500">
        {status.reduce((s, it) => s + it.value, 0)} total
      </div>
    </div>

    {/* Stack on mobile, split on desktop */}
    <div className="mt-3 flex flex-col md:flex-row items-center gap-4">
      {/* pie chart (responsive height) */}
      <div
        className="w-full md:w-1/2 h-40 md:h-48 focus:outline-none"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        aria-hidden="true"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={status}
              dataKey="value"
              nameKey="name"
              innerRadius={36}
              outerRadius={60}
              paddingAngle={4}
            >
              {status.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ paddingTop: 6 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* legend / breakdown */}
      <div className="w-full md:w-1/2">
        <ul className="space-y-2 text-sm md:text-base">
          {status.map((s) => (
            <li key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: s.color }}
                  aria-hidden="true"
                />
                <span className="text-sm md:text-base text-slate-700">{s.name}</span>
              </div>
              <div className="text-sm md:text-base text-slate-800 font-medium">{s.value}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</div>


      {/* upcoming appointments + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h3>
            <button type="button" className="text-sm text-blue-600 hover:underline">View all</button>
          </div>

          <div className="divide-y">
            {appointments.map((a) => (
              <div key={a.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="font-medium text-slate-800">{a.patient}</div>
                  <div className="text-sm text-slate-500">{a.doctor} • {a.date}</div>
                </div>
                <div className={`text-sm font-medium ${a.status === 'Confirmed' ? 'text-green-600' : a.status === 'Pending' ? 'text-amber-600' : 'text-red-600'}`}>
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Recent Activity</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Dr. Sara added notes to John Doe's appointment (2 hours ago)</li>
            <li>Mary Ali updated insurance details (yesterday)</li>
            <li>System backup completed successfully (2 days ago)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
