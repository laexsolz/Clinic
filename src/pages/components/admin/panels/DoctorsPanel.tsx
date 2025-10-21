import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

interface Availability {
  day: string;
  from: string;
  to: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  speciality: string;
  availability: Availability[];
}

export default function DoctorsPanel() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      firstName: 'Sara',
      lastName: 'Khan',
      speciality: 'Cardiologist',
      availability: [
        { day: 'Mon', from: '09:00', to: '13:00' },
        { day: 'Wed', from: '14:00', to: '18:00' },
      ],
    },
    {
      id: 2,
      firstName: 'Ahmed',
      lastName: 'Malik',
      speciality: 'Dermatologist',
      availability: [
        { day: 'Tue', from: '10:00', to: '16:00' },
        { day: 'Thu', from: '09:00', to: '12:00' },
      ],
    },
  ]);

  const emptyForm: Omit<Doctor, 'id'> = {
    firstName: '',
    lastName: '',
    speciality: '',
    availability: [{ day: 'Mon', from: '09:00', to: '17:00' }],
  };

  const [form, setForm] = useState<Omit<Doctor, 'id'>>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const openAddModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditing(doc.id);
    setForm({
      firstName: doc.firstName,
      lastName: doc.lastName,
      speciality: doc.speciality,
      availability: [...doc.availability],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setEditing(null);
    }, 300);
  };

  const handleFormChange = (field: keyof Omit<Doctor, 'id' | 'availability'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (index: number, key: keyof Availability, value: string) => {
    setForm((prev) => {
      const updated = [...prev.availability];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, availability: updated };
    });
  };

  const addAvailabilityRow = () => {
    setForm((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: 'Mon', from: '09:00', to: '17:00' }],
    }));
  };

  const removeAvailabilityRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.speciality) return;

    if (editing) {
      setDoctors((list) => list.map((d) => (d.id === editing ? { ...d, ...form } : d)));
    } else {
      const nextId = doctors.length ? Math.max(...doctors.map((d) => d.id)) + 1 : 1;
      setDoctors((list) => [...list, { id: nextId, ...form }]);
    }

    closeModal();
  };

  const openDeleteModal = (id: number) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = () => {
    if (deleteModal.id !== null) {
      setDoctors((list) => list.filter((d) => d.id !== deleteModal.id));
    }
    setDeleteModal({ open: false, id: null });
  };

  const initials = (d: Doctor) => `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`.toUpperCase();

  const availabilitySummary = (doc: Doctor) =>
    doc.availability.map((a) => `${a.day} ${a.from}-${a.to}`).join(', ');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">List of Doctors</h2>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium">
                {initials(doc)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">Dr. {doc.firstName} {doc.lastName}</div>
                    <div className="text-sm text-slate-500">{doc.speciality}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(doc)}
                      className="text-sm px-2 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(doc.id)}
                      className="text-sm px-2 py-1 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                    >
                      <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  <div className="font-medium text-sm">Availability</div>
                  <div className="text-xs mt-1">{availabilitySummary(doc) || 'No availability set'}</div>
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  <div className="font-medium text-sm">Next Slot</div>
                  <div className="text-xs mt-1">
                    {doc.availability?.[0]
                      ? `${doc.availability[0].day} ${doc.availability[0].from}`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/40" onClick={closeModal} />
            <motion.form
              onSubmit={handleSubmit}
              className="relative z-10 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editing ? 'Edit Doctor' : 'Add Doctor'}</h3>
                <button type="button" onClick={closeModal} className="text-slate-500">Close</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={form.firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('firstName', e.target.value)}
                  placeholder="First name"
                  className="px-3 py-2 rounded-md border border-slate-200"
                />
                <input
                  value={form.lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className="px-3 py-2 rounded-md border border-slate-200"
                />
                <input
                  value={form.speciality}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('speciality', e.target.value)}
                  placeholder="Speciality (e.g. Cardiologist)"
                  className="px-3 py-2 rounded-md border border-slate-200 sm:col-span-2"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Availability</div>
                  <button type="button" onClick={addAvailabilityRow} className="text-sm px-2 py-1 rounded-md border bg-slate-50">Add row</button>
                </div>

                <div className="space-y-2">
                  {form.availability.map((a, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <select
                        value={a.day}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAvailabilityChange(i, 'day', e.target.value)}
                        className="col-span-3 px-2 py-2 rounded-md border"
                      >
                        <option>Mon</option>
                        <option>Tue</option>
                        <option>Wed</option>
                        <option>Thu</option>
                        <option>Fri</option>
                        <option>Sat</option>
                        <option>Sun</option>
                      </select>
                      <input
                        type="time"
                        value={a.from}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAvailabilityChange(i, 'from', e.target.value)}
                        className="col-span-3 px-2 py-2 rounded-md border"
                      />
                      <input
                        type="time"
                        value={a.to}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleAvailabilityChange(i, 'to', e.target.value)}
                        className="col-span-3 px-2 py-2 rounded-md border"
                      />
                      <div className="col-span-3 text-right">
                        <button type="button" onClick={() => removeAvailabilityRow(i)} className="px-2 py-1 rounded-md border bg-red-50 text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">{editing ? 'Save changes' : 'Create doctor'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/40" onClick={() => setDeleteModal({ open: false, id: null })} />
            <motion.div
              className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
              <p className="text-slate-600 mb-5">Are you sure you want to delete this doctor? This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteModal({ open: false, id: null })} className="px-4 py-2 rounded-md border">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}