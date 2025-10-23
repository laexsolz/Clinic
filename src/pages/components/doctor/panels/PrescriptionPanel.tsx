import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Plus,
  FileText,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
} from "lucide-react";

// PrescriptionPanel.tsx
// - Search patients by name or ID
// - View patient list, open patient card modal to create a prescription
// - Prescriptions stored in localStorage under key `prescriptions` (object by patientId)
// - View/Edit/Delete prescriptions in a modal
// - Responsive, modern UI using Tailwind + framer-motion + lucide-react

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

type Prescription = {
  id: string;
  date: string; // ISO
  meds: string; // free text
  notes?: string;
};

const SAMPLE_PATIENTS: Patient[] = [
  { id: "P-1001", name: "Sarah Connor", age: 29, gender: "F" },
  { id: "P-1002", name: "Liam Walker", age: 42, gender: "M" },
  { id: "P-1003", name: "Jessica Martin", age: 41, gender: "F" },
  { id: "P-1004", name: "Carlos Mendez", age: 38, gender: "M" },
  { id: "P-1005", name: "Emily Brown", age: 31, gender: "F" },
  { id: "P-1006", name: "Noor Fatima", age: 26, gender: "F" },
  { id: "P-1007", name: "David Kim", age: 45, gender: "M" },
];

const STORAGE_KEY = "prescriptions";

function uid(prefix = "p") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function PrescriptionPanel() {
  const [query, setQuery] = useState("");
  const [patients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPrescriptionsFor, setViewingPrescriptionsFor] = useState<Patient | null>(null);

  // prescriptionsByPatient: { [patientId]: Prescription[] }
  const [prescriptionsByPatient, setPrescriptionsByPatient] = useState<Record<string, Prescription[]>>({});

  // form state for new/edit prescription
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [formMeds, setFormMeds] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    // load from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrescriptionsByPatient(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load prescriptions from localStorage", e);
    }
  }, []);

  useEffect(() => {
    // persist to localStorage when changed
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptionsByPatient));
    } catch (e) {
      console.warn("Failed to save prescriptions to localStorage", e);
    }
  }, [prescriptionsByPatient]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [patients, query]);

  function openNewPrescription(patient: Patient) {
    // close viewing modal if open to avoid stacking
    setViewingPrescriptionsFor(null);
    setSelectedPatient(patient);
    setEditing(null);
    setFormMeds("");
    setFormNotes("");
    setFormDate(new Date().toISOString());
  }

  function openEditPrescription(patient: Patient, rx: Prescription) {
    // close viewing modal so edit modal becomes the active one
    setViewingPrescriptionsFor(null);
    setSelectedPatient(patient);
    setEditing(rx);
    setFormMeds(rx.meds);
    setFormNotes(rx.notes ?? "");
    setFormDate(rx.date);
  }

  function savePrescription(patientId: string) {
    const pres: Prescription = editing
      ? { ...editing, meds: formMeds, notes: formNotes, date: formDate }
      : { id: uid("rx"), meds: formMeds, notes: formNotes, date: formDate };

    setPrescriptionsByPatient((prev) => {
      const list = prev[patientId] ? [...prev[patientId]] : [];
      if (editing) {
        const idx = list.findIndex((p) => p.id === pres.id);
        if (idx >= 0) list[idx] = pres;
      } else {
        list.unshift(pres); // newest first
      }
      return { ...prev, [patientId]: list };
    });

    // close modal
    setSelectedPatient(null);
    setEditing(null);
  }

  function deletePrescription(patientId: string, rxId: string) {
    setPrescriptionsByPatient((prev) => {
      const list = prev[patientId] ? prev[patientId].filter((r) => r.id !== rxId) : [];
      return { ...prev, [patientId]: list };
    });
  }

  function handleViewPrescriptions(patient: Patient) {
    setViewingPrescriptionsFor(patient);
  }

  return (
    <div className="w-full p-3">
      {/* header / search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name or ID"
            className="min-w-0 w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
        <button onClick={() => setQuery("")} className="px-3 py-2 rounded-xl border bg-white text-sm shadow-sm">
          Clear
        </button>
      </div>

      {/* patients list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }} className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-base flex items-center gap-2 truncate"><User className="w-4 h-4" /> <span className="truncate">{p.name}</span></h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{p.id} • {p.age ? `${p.age} yrs` : "Age N/A"}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-slate-400 text-right">
                  <div className="font-medium">{(prescriptionsByPatient[p.id] || []).length}</div>
                  <div className="text-[11px] mt-1 text-slate-500">prescriptions</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-3 line-clamp-2">Gender: {p.gender ? `${p.gender}` : ""}</p>
            </div>

            <div className="mt-4 flex gap-2 sm:gap-3 flex-col sm:flex-row">
              <button onClick={() => openNewPrescription(p)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm w-full sm:w-auto">
                <Plus className="w-4 h-4" /> New Rx
              </button>
              <button onClick={() => handleViewPrescriptions(p)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border text-sm w-full sm:w-auto">
                <FileText className="w-4 h-4" /> View Rx
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New / Edit Prescription Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div key="backdrop-rx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => { setSelectedPatient(null); setEditing(null); }} />

            <motion.div key="modal-rx" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> {selectedPatient.name}</h3>
                    <p className="text-sm text-slate-500">{selectedPatient.id} • {selectedPatient.age ? `${selectedPatient.age} yrs` : "Age N/A"}</p>
                  </div>
                  <button onClick={() => { setSelectedPatient(null); setEditing(null); }} className="p-2 rounded-md hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium">Date & time</label>
                  <input type="datetime-local" value={formDate.slice(0,16)} onChange={(e)=> setFormDate(new Date(e.target.value).toISOString())} className="w-full rounded-md border px-3 py-2" />

                  <label className="block text-sm font-medium">Medications / Prescription</label>
                  <textarea value={formMeds} onChange={(e)=> setFormMeds(e.target.value)} rows={4} className="w-full rounded-md border px-3 py-2" placeholder="Example: Paracetamol 500mg — 1 tab TDS for 5 days" />

                  <label className="block text-sm font-medium">Notes (optional)</label>
                  <textarea value={formNotes} onChange={(e)=> setFormNotes(e.target.value)} rows={2} className="w-full rounded-md border px-3 py-2" placeholder="Any additional instructions" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => { setSelectedPatient(null); setEditing(null); }} className="px-4 py-2 rounded-md border bg-white">Cancel</button>
                  <button onClick={() => savePrescription(selectedPatient.id)} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center gap-2"><Save className="w-4 h-4" /> {editing ? "Save" : "Give Rx"}</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View / Manage Prescriptions Modal */}
      <AnimatePresence>
        {viewingPrescriptionsFor && (
          <>
            <motion.div key="backdrop-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setViewingPrescriptionsFor(null)} />

            <motion.div key="modal-view" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div onClick={(e)=> e.stopPropagation()} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Prescriptions — {viewingPrescriptionsFor.name}</h3>
                    <p className="text-sm text-slate-500">{viewingPrescriptionsFor.id}</p>
                  </div>
                  <button onClick={()=> setViewingPrescriptionsFor(null)} className="p-2 rounded-md hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>

                <div className="mt-4">
                  {(!prescriptionsByPatient[viewingPrescriptionsFor.id] || prescriptionsByPatient[viewingPrescriptionsFor.id].length === 0) ? (
                    <div className="text-sm text-slate-500">No prescriptions yet. Use "New Rx" from the patient card.</div>
                  ) : (
                    <ul className="space-y-3">
                      {prescriptionsByPatient[viewingPrescriptionsFor.id].map((rx) => (
                        <li key={rx.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{rx.meds}</div>
                            <div className="text-xs text-slate-500">{formatDateTime(rx.date)}</div>
                            {rx.notes && <div className="text-xs text-slate-600 mt-2 truncate">{rx.notes}</div>}
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            <button onClick={()=> openEditPrescription(viewingPrescriptionsFor, rx)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                            <button onClick={()=> deletePrescription(viewingPrescriptionsFor.id, rx.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 text-white text-sm"><Trash2 className="w-4 h-4" /> Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={()=> setViewingPrescriptionsFor(null)} className="px-4 py-2 rounded-md border bg-white">Close</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
