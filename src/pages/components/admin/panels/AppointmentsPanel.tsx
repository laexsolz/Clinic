// components/admin/panels/AppointmentsPanel.tsx
import React, { useMemo, useState } from 'react';
import { Plus, X, User, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  datetime: string; // 'YYYY-MM-DDTHH:mm' (datetime-local)
  status: 'Pending' | 'Confirmed' | 'Cancelled';
};

const initialData: Appointment[] = [
  { id: 'a1', patient: 'John Doe', doctor: 'Dr. Sara Khan', datetime: '2025-10-22T10:00', status: 'Pending' },
  { id: 'a2', patient: 'Mary Ali', doctor: 'Dr. Ahmed Malik', datetime: '2025-10-23T11:30', status: 'Confirmed' },
  { id: 'a3', patient: 'Ali Rehman', doctor: 'Dr. Sara Khan', datetime: '2025-10-24T09:00', status: 'Confirmed' },
  { id: 'a4', patient: 'Fatima Noor', doctor: 'Dr. Zain Iqbal', datetime: '2025-10-25T14:15', status: 'Pending' },
  { id: 'a5', patient: 'Omar Siddiqui', doctor: 'Dr. Ahmed Malik', datetime: '2025-10-26T13:00', status: 'Cancelled' },
  { id: 'a6', patient: 'Ayesha Khan', doctor: 'Dr. Sara Khan', datetime: '2025-10-27T15:30', status: 'Pending' },
];

const STATUS_OPTIONS: Appointment['status'][] = ['Pending', 'Confirmed', 'Cancelled'];

/**
 * InlineStatusCombobox
 * - lightweight accessible combobox to pick status
 * - props: value, onChange
 */
function InlineStatusCombobox({
  value,
  onChange,
}: {
  value: Appointment['status'];
  onChange: (v: Appointment['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        onBlur={() => setTimeout(() => setOpen(false), 120)} // small timeout to allow click
        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${value === 'Confirmed' ? 'bg-green-100 text-green-700' : value === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          } focus:outline-none`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-md z-50 py-1"
            role="listbox"
            aria-label="Status options"
          >
            {STATUS_OPTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // keep focus
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppointmentsPanel(): JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // id pending deletion (for modal)

  // form state
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [datetime, setDatetime] = useState(''); // datetime-local value
  const [status, setStatus] = useState<Appointment['status']>('Pending');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setPatient('');
    setDoctor('');
    setDatetime('');
    setStatus('Pending');
    setError('');
    setIsOpen(true);
  };

  const openEditModal = (appt: Appointment) => {
    setEditingId(appt.id);
    setPatient(appt.patient);
    setDoctor(appt.doctor);
    setDatetime(appt.datetime);
    setStatus(appt.status);
    setError('');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!patient.trim() || !doctor.trim() || !datetime) {
      setError('Please fill patient, doctor and date/time.');
      return;
    }

    if (editingId) {
      setAppointments((prev) =>
        prev.map((it) => (it.id === editingId ? { ...it, patient: patient.trim(), doctor: doctor.trim(), datetime, status } : it))
      );
    } else {
      const newAppt: Appointment = {
        id: `a${Date.now()}`,
        patient: patient.trim(),
        doctor: doctor.trim(),
        datetime,
        status,
      };
      setAppointments((p) => [newAppt, ...p]);
    }

    closeModal();
  };

  // When the user selects a date/time, blur the input so native picker closes on many platforms
  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatetime(e.target.value);
    // blur after small timeout to let the value set; this causes most native pickers to close
    setTimeout(() => {
      (e.target as HTMLInputElement).blur();
    }, 50);
  };

  const handleDelete = (id: string) => {
    // open confirmation modal
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setAppointments((prev) => prev.filter((it) => it.id !== deleteId));
    setDeleteId(null);
  };

  const cancelDelete = () => setDeleteId(null);

  const upcomingCount = useMemo(() => appointments.length, [appointments]);

  const formatDateDisplay = (isoLike: string) => {
    try {
      const dt = new Date(isoLike);
      return dt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoLike;
    }
  };

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>

          <div className="text-sm text-slate-500">Manage upcoming appointments</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 hidden sm:inline">
            Total: <span className="font-medium">{upcomingCount}</span>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="
            inline-flex items-center gap-2 
            px-2 py-1.5 text-xs
            sm:px-3 sm:py-2 sm:text-sm 
            rounded-md bg-blue-600 text-white 
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300
  "
            aria-label="New appointment"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>New Appointment</span>
          </button>

        </div>
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{a.patient}</div>
                    <div className="text-xs text-slate-500">ID: {a.id}</div>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-slate-700">{a.doctor}</div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="text-slate-700">{formatDateDisplay(a.datetime)}</div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <InlineStatusCombobox
                    value={a.status}
                    onChange={(v) =>
                      setAppointments((prev) => prev.map((it) => (it.id === a.id ? { ...it, status: v } : it)))
                    }
                  />
                </td>

                <td className="px-4 py-3 text-sm text-right">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openEditModal(a)}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                      type="button"
                      title="Edit appointment"
                      aria-label={`Edit ${a.patient}`}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden lg:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs"
                      type="button"
                      title="Delete appointment"
                      aria-label={`Delete ${a.patient}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden lg:inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {appointments.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-md">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">{a.patient}</div>
                  <div className="text-xs text-slate-500">{a.doctor} • {formatDateDisplay(a.datetime)}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-2">
                  <InlineStatusCombobox
                    value={a.status}
                    onChange={(v) => setAppointments((prev) => prev.map((it) => (it.id === a.id ? { ...it, status: v } : it)))}
                  />
                </div>

                <div className="mt-2 flex items-center gap-2 justify-end">
                  <button
                    onClick={() => openEditModal(a)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs"
                    type="button"
                    aria-label={`Edit ${a.patient}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs"
                    type="button"
                    aria-label={`Delete ${a.patient}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add / Edit Appointment */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.form
              onSubmit={handleSubmit}
              className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Appointment' : 'New Appointment'}</h3>
                <button type="button" onClick={closeModal} className="p-2 rounded-md hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && <div className="mb-3 text-sm text-red-700 bg-red-50 px-3 py-2 rounded">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-xs text-slate-500 mb-1">Patient</div>
                  <input
                    value={patient}
                    onChange={(e) => setPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                    placeholder="Patient name"
                    type="text"
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-slate-500 mb-1">Doctor</div>
                  <input
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                    placeholder="Doctor name"
                    type="text"
                    required
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Date & Time</div>
                  <input
                    value={datetime}
                    onChange={handleDatetimeChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                    type="datetime-local"
                    required
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div>
                    <InlineStatusCombobox value={status} onChange={(v) => setStatus(v)} />
                  </div>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-3 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  {editingId ? 'Update' : 'Add Appointment'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
            />

            <motion.div
              className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 6 }}
            >
              <div className="flex items-start gap-3">
                <div className="bg-red-50 p-2 rounded-md">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete appointment?</h3>
                  <p className="text-sm text-slate-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={cancelDelete} className="px-3 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
