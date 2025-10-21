// pages/admin/index.tsx (or src/pages/admin/index.tsx)
import React, { useMemo } from 'react';
import { useState } from 'react';
import AdminLayout, { AdminView } from './components/admin/AdminLayout';
import AppointmentsPanel from './components/admin/panels/AppointmentsPanel';
import DoctorsPanel from './components/admin/panels/DoctorsPanel';
import PatientsPanel from './components/admin/panels/PatientsPanel';
import BillingPanel from './components/admin/panels/BillingPanel';
import DashboardPanel from './components/admin/panels/DashboardPanel';



export default function AdminPage() {
  const [active, setActive] = useState<AdminView>('dashboard');

  const ActiveComponent = useMemo(() => {
    switch (active) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'appointments':
        return <AppointmentsPanel />;
      case 'doctors':
        return <DoctorsPanel />;
      case 'patients':
        return <PatientsPanel />;
      case 'billing':
        return <BillingPanel />;
      default:
        return <DashboardPanel />;
    }
  }, [active]);

  return (
    <AdminLayout initialView="dashboard" view={active} onViewChange={(v) => setActive(v)}>
      {/* top area */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 capitalize">{active}</h1>

        <div className="hidden md:flex gap-2">
          {(['dashboard','appointments','doctors','patients','billing'] as AdminView[]).map((v) => (
            <button
              key={v}
              onClick={() => setActive(v)}
              className={`px-3 py-1 rounded-md text-sm ${
                active === v ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
              type="button"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* main dynamic content */}
      <div>{ActiveComponent}</div>
    </AdminLayout>
  );
}

