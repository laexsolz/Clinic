import React, { useState, ChangeEvent, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'

interface Visit {
  date: string // ISO date
  reason: string
  initial: boolean
  lastDoctor?: string
  prescription?: string
}

interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: 'Active' | 'Inactive'
  summary: string
  visits: Visit[]
}

export default function PatientsPanel() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+92-300-0000000',
      status: 'Active',
      summary: 'Complains of chest pain and shortness of breath. Referred for ECG.',
      visits: [
        {
          date: '2025-10-10',
          reason: 'Initial consult - chest pain',
          initial: true,
          lastDoctor: undefined,
          prescription: 'Aspirin 75mg once daily',
        },
      ],
    },
    {
      id: 2,
      firstName: 'Ayesha',
      lastName: 'Raza',
      email: 'ayesha@example.com',
      phone: '+92-300-1111111',
      status: 'Active',
      summary: 'Follow-up for eczema. Uses topical steroid occasionally.',
      visits: [
        {
          date: '2025-09-20',
          reason: 'Follow-up for eczema',
          initial: false,
          lastDoctor: 'Dr. Ahmed Malik',
          prescription: 'Hydrocortisone cream 1% - apply twice daily',
        },
      ],
    },
  ])

  const emptyForm: Omit<Patient, 'id' | 'visits'> & { visits: Visit[] } = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'Active',
    summary: '',
    visits: [
      { date: new Date().toISOString().slice(0, 10), reason: '', initial: true, lastDoctor: undefined, prescription: '' },
    ],
  }

  const [form, setForm] = useState<typeof emptyForm>(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: Patient) => {
    setEditingId(p.id)
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone ?? '',
      status: p.status,
      summary: p.summary,
      visits: JSON.parse(JSON.stringify(p.visits)),
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setTimeout(() => {
      setForm(emptyForm)
      setEditingId(null)
    }, 250)
  }

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((s) => ({ ...s, [field]: value }))
  }

  const handleVisitChange = (index: number, key: keyof Visit, value: string | boolean) => {
    setForm((s) => {
      const visits = [...s.visits]
      visits[index] = { ...visits[index], [key]: value }
      return { ...s, visits }
    })
  }

  const addVisit = () => {
    setForm((s) => ({ ...s, visits: [...s.visits, { date: new Date().toISOString().slice(0, 10), reason: '', initial: false }] }))
  }

  const removeVisit = (index: number) => {
    setForm((s) => ({ ...s, visits: s.visits.filter((_, i) => i !== index) }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email) return

    if (editingId) {
      setPatients((list) => list.map((p) => (p.id === editingId ? { ...p, ...form, id: editingId } as Patient : p)))
    } else {
      const nextId = patients.length ? Math.max(...patients.map((p) => p.id)) + 1 : 1
      setPatients((list) => [...list, { id: nextId, ...form } as Patient])
    }

    closeModal()
  }

  const requestDelete = (id: number) => setDeleteId(id)
  const cancelDelete = () => setDeleteId(null)
  const confirmDelete = () => {
    if (deleteId !== null) setPatients((list) => list.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }

  const openDetails = (p: Patient) => setSelectedPatient(p)
  const closeDetails = () => setSelectedPatient(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Patients</h2>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <article
            key={p.id}
            onClick={() => openDetails(p)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.firstName} {p.lastName}</div>
                <div className="text-xs text-slate-500">{p.email} • {p.phone}</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                {p.status}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{p.summary}</p>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">Last visit: {p.visits?.[0]?.date ?? '—'}</div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); openEdit(p) }} className="text-xs px-2 py-1 rounded-md border bg-slate-50">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); requestDelete(p.id) }} className="text-xs px-2 py-1 rounded-md border bg-red-50 text-red-700 flex items-center">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/40" onClick={closeModal} />
            <motion.form onSubmit={submit} className="relative z-10 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200" initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Patient' : 'Add Patient'}</h3>
                <button type="button" onClick={closeModal} className="text-slate-500">Close</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={form.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('firstName', e.target.value)} placeholder="First name" className="px-3 py-2 rounded-md border border-slate-200" />
                <input value={form.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('lastName', e.target.value)} placeholder="Last name" className="px-3 py-2 rounded-md border border-slate-200" />
                <input value={form.email} onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('email', e.target.value)} placeholder="Email" className="px-3 py-2 rounded-md border border-slate-200 sm:col-span-2" />
                <input value={form.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => handleFormChange('phone', e.target.value)} placeholder="Phone" className="px-3 py-2 rounded-md border border-slate-200 sm:col-span-2" />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Visits</div>
                  <button type="button" onClick={addVisit} className="text-sm px-2 py-1 rounded-md border bg-slate-50">Add visit</button>
                </div>

                <div className="space-y-2">
                  {form.visits.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input type="date" value={v.date} onChange={(e: ChangeEvent<HTMLInputElement>) => handleVisitChange(i, 'date', e.target.value)} className="col-span-3 px-2 py-2 rounded-md border" />
                      <input value={v.reason} onChange={(e: ChangeEvent<HTMLInputElement>) => handleVisitChange(i, 'reason', e.target.value)} placeholder="Reason" className="col-span-4 px-2 py-2 rounded-md border" />
                      <select value={v.initial ? 'yes' : 'no'} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleVisitChange(i, 'initial', e.target.value === 'yes')} className="col-span-2 px-2 py-2 rounded-md border">
                        <option value="yes">Initial</option>
                        <option value="no">Follow-up</option>
                      </select>
                      <input value={v.lastDoctor ?? ''} onChange={(e: ChangeEvent<HTMLInputElement>) => handleVisitChange(i, 'lastDoctor', e.target.value)} placeholder="Last doctor" className="col-span-3 px-2 py-2 rounded-md border" />
                      <div className="col-span-12 text-right mt-1">
                        <button type="button" onClick={() => removeVisit(i)} className="px-2 py-1 rounded-md border bg-red-50 text-red-700">Remove</button>
                      </div>
                      <textarea value={v.prescription ?? ''} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleVisitChange(i, 'prescription', e.target.value)} placeholder="Prescription / Notes" className="col-span-12 px-2 py-2 rounded-md border mt-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea value={form.summary} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFormChange('summary', e.target.value)} className="w-full px-3 py-2 rounded-md border" />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-3 py-2 rounded-md border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">{editingId ? 'Save changes' : 'Create patient'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation (same visual as doctor) */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelDelete} />

            <motion.div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6" initial={{ scale: 0.98, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 6 }}>
              <div className="flex items-start gap-3">
                <div className="bg-red-50 p-2 rounded-md">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete patient?</h3>
                  <p className="text-sm text-slate-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={cancelDelete} className="px-3 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient details modal (open when a card is clicked) */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div className="fixed inset-0 z-60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
            <motion.div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200" initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0, scale: 0.98 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div className="text-sm text-slate-500">{selectedPatient.email} • {selectedPatient.phone}</div>
                </div>
                <div className="text-sm text-slate-500">Status: {selectedPatient.status}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Summary</h4>
                  <p className="text-sm text-slate-600 mt-2">{selectedPatient.summary}</p>

                  <h4 className="font-medium mt-4">Visits</h4>
                  <div className="space-y-3 mt-2">
                    {selectedPatient.visits.map((v, i) => (
                      <div key={i} className="p-3 border rounded-md bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{v.date} • {v.initial ? 'Initial' : 'Follow-up'}</div>
                          <div className="text-xs text-slate-500">{v.reason}</div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">Doctor: {v.lastDoctor ?? '—'}</div>
                        <div className="mt-1 text-sm text-slate-600">Prescription: {v.prescription ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Actions</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    <button onClick={() => { openEdit(selectedPatient) }} className="px-3 py-2 rounded-md border bg-slate-50 text-left">Edit patient</button>
                    <button onClick={() => { requestDelete(selectedPatient.id); closeDetails() }} className="px-3 py-2 rounded-md border bg-red-50 text-red-700">Delete patient</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={closeDetails} className="px-3 py-2 rounded-md border">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
