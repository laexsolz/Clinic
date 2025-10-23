// pages/Doctor/index.tsx (or src/pages/Doctor/index.tsx)
import React, { useMemo } from 'react';
import { useState } from 'react';
import DoctorLayout, { DoctorView } from './components/doctor/DoctorLayout';
import DoctorAppointmentsPanel from './components/doctor/panels/DoctorAppointmentsPanel';
import PatientsHistoryPanel from './components/doctor/panels/PatientHistoryPanel';
import PrescriptionPanel from './components/doctor/panels/PrescriptionPanel';




export default function DoctorAppointments() {
  const [active, setActive] = useState<DoctorView>('Appointments');

  const ActiveComponent = useMemo(() => {
    switch (active) {
      case 'Appointments':
        return <DoctorAppointmentsPanel/>;
      case 'Patients History':
        return <PatientsHistoryPanel/>;
      case 'Prescription':
        return <PrescriptionPanel/>;
    
    }
  }, [active]);

  return (
    <DoctorLayout initialView="Appointments" view={active} onViewChange={(v) => setActive(v)}>
      {/* top area */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 capitalize">{active}</h1>

        <div className="hidden md:flex gap-2">
          {(['Appointments','Patients History','Prescription'] as DoctorView[]).map((v) => (
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
    </DoctorLayout>
  );
}

