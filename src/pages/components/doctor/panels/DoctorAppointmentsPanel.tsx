import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Info,
  X,
  Heart,
  Pill,
  FileText,
  ChevronRight,
} from "lucide-react";

// Compact panel variant designed to be embedded inside a dashboard
// - Width/margins reduced so it fits dashboard panels (use full width of parent)
// - Shows 'Upcoming appointments' at the top (as requested)
// - Separates Upcoming (next 7 days), Future (beyond 7 days) and Past
// - Uses a subtle modal (no heavy darkening) so the page doesn't go "dull"
// - Shows a small 'Now' time-dot badge for appointments within the next hour
// - Static data remains easy to swap for API-driven data later

type Visit = {
  id: string;
  date: string; // ISO date/time
  patientName: string;
  age?: number;
  reason?: string;
  status?: "scheduled" | "completed" | "cancelled";
  previousVisits?: Array<{ date: string; notes?: string }>;
  meds?: string[];
  notes?: string;
};

const sampleAppointments: Visit[] = [
  {
    id: "a1",
    date: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // in ~2 hours
    patientName: "Sarah Khan",
    age: 29,
    reason: "Follow-up: hypertension",
    status: "scheduled",
    previousVisits: [{ date: "2025-07-11", notes: "Adjusted dosage of Amlodipine" }],
    meds: ["Amlodipine 5mg"],
    notes: "Patient reported mild headaches last week.",
  },
  {
    id: "a2",
    date: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // in ~30 minutes -> should get 'Now' badge
    patientName: "Ali Raza",
    age: 43,
    reason: "New: chest pain",
    status: "scheduled",
    previousVisits: [],
    meds: [],
    notes: "Referred from ER for cardiac consult.",
  },
  {
    id: "a3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    patientName: "Maya Siddiqui",
    age: 35,
    reason: "Routine checkup",
    status: "completed",
    previousVisits: [
      { date: "2024-12-01", notes: "Routine bloods, stable" },
      { date: "2025-04-20", notes: "Prescribed Vit D" },
    ],
    meds: ["Vitamin D 1000 IU"],
    notes: "All vitals within normal range.",
  },
  {
    id: "a4",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // in 12 days -> future
    patientName: "Hassan Ali",
    age: 50,
    reason: "Diabetes review",
    status: "scheduled",
    previousVisits: [{ date: "2025-03-03", notes: "Started Metformin" }],
    meds: ["Metformin 500mg"],
    notes: "Bring blood sugar log.",
  },
  {
  id: "a5",
  date: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), // in ~5 hours
  patientName: "Noor Fatima",
  age: 26,
  reason: "Postpartum follow-up",
  status: "scheduled",
  previousVisits: [{ date: "2025-09-10", notes: "C-section recovery, mild anemia" }],
  meds: ["Iron supplements", "Multivitamin"],
  notes: "Assess wound healing and iron levels.",
},
{
  id: "a6",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // in 3 days
  patientName: "Zain Ahmed",
  age: 32,
  reason: "Dermatology: acne treatment",
  status: "scheduled",
  previousVisits: [
    { date: "2025-07-05", notes: "Started topical retinoid" },
    { date: "2025-08-15", notes: "Improvement noted" },
  ],
  meds: ["Adapalene cream", "Doxycycline 100mg"],
  notes: "Check skin response and side effects.",
},
{
  id: "a7",
  date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
  patientName: "Rizwan Malik",
  age: 47,
  reason: "Orthopedic: back pain",
  status: "completed",
  previousVisits: [
    { date: "2025-05-22", notes: "Prescribed physical therapy" },
    { date: "2025-07-14", notes: "MRI ordered, no major issues" },
  ],
  meds: ["Naproxen 250mg"],
  notes: "Recommended posture correction and exercise routine.",
},
{
  id: "a8",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), // in 20 days
  patientName: "Jessica Martin",
  age: 41,
  reason: "ENT: sinus congestion",
  status: "scheduled",
  previousVisits: [{ date: "2025-06-09", notes: "Prescribed nasal corticosteroid" }],
  meds: ["Fluticasone nasal spray"],
  notes: "Review CT sinus results if available.",
},
{
  id: "a9",
  date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
  patientName: "Carlos Mendez",
  age: 38,
  reason: "Follow-up: high cholesterol",
  status: "completed",
  previousVisits: [
    { date: "2025-03-11", notes: "Started Rosuvastatin" },
    { date: "2025-06-12", notes: "Cholesterol improved by 20%" },
  ],
  meds: ["Rosuvastatin 10mg"],
  notes: "Encouraged continued dietary improvements.",
},
{
  id: "a10",
  date: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // in 10 minutes — should show 'Now'
  patientName: "Ayesha Tariq",
  age: 52,
  reason: "Neurology: migraine management",
  status: "scheduled",
  previousVisits: [
    { date: "2025-05-01", notes: "Initiated propranolol prophylaxis" },
    { date: "2025-08-02", notes: "Reported fewer attacks" },
  ],
  meds: ["Propranolol 40mg"],
  notes: "Track frequency and severity of migraines.",
},
{
  id: "a11",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // in 5 days
  patientName: "Emily Brown",
  age: 31,
  reason: "Psychiatry: anxiety follow-up",
  status: "scheduled",
  previousVisits: [{ date: "2025-09-15", notes: "Started Sertraline" }],
  meds: ["Sertraline 50mg"],
  notes: "Evaluate medication side effects and progress.",
},
{
  id: "a12",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // in 7 days
  patientName: "David Kim",
  age: 45,
  reason: "Gastroenterology: acid reflux",
  status: "scheduled",
  previousVisits: [
    { date: "2025-05-28", notes: "Advised dietary modification" },
    { date: "2025-07-11", notes: "Prescribed Omeprazole" },
  ],
  meds: ["Omeprazole 20mg"],
  notes: "Check for long-term medication dependency.",
},
{
  id: "a13",
  date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
  patientName: "Laura Wilson",
  age: 34,
  reason: "OB-GYN: fertility consultation",
  status: "completed",
  previousVisits: [{ date: "2025-02-22", notes: "Scheduled hormonal tests" }],
  meds: [],
  notes: "Review recent lab results and discuss treatment options.",
},
{
  id: "a14",
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(), // in 9 days
  patientName: "James Thompson",
  age: 57,
  reason: "Cardiology: annual review",
  status: "scheduled",
  previousVisits: [
    { date: "2025-01-10", notes: "Stable ECG, continue meds" },
    { date: "2025-07-05", notes: "Blood pressure under control" },
  ],
  meds: ["Aspirin 81mg", "Lisinopril 10mg"],
  notes: "Reassess dosage and lipid profile.",
},

];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function timeAgoOrTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return formatDate(iso);
}

function minutesUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

export default function DoctorAppointmentsPanel() {
  const [appointments] = useState<Visit[]>(sampleAppointments);
  const [selected, setSelected] = useState<Visit | null>(null);

  // Partition: upcoming (0-7 days), future (>7 days), past (<0 days)
  const { upcoming, future, past } = useMemo(() => {
    const up: Visit[] = [];
    const fut: Visit[] = [];
    const pa: Visit[] = [];
    const now = Date.now();
    const sevenDaysMs = 1000 * 60 * 60 * 24 * 7;

    appointments.forEach((a) => {
      const t = new Date(a.date).getTime();
      if (t < now) pa.push(a);
      else if (t - now <= sevenDaysMs) up.push(a);
      else fut.push(a);
    });

    up.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
    fut.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
    pa.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

    return { upcoming: up, future: fut, past: pa };
  }, [appointments]);

  return (
    <div className="w-full p-3"> {/* reduced margins so it fits dashboard panels */}
      {/* Panel header is removed on purpose (dashboard supplies it). We add a small local heading for upcoming list */}
      <div className="mb-4">
        <h2 className="text-xl font-medium">Upcoming appointments</h2>
        <p className="text-sm text-slate-500">Showing next 7 days — click a card for details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map((a) => {
          const mins = minutesUntil(a.date);
          const isNow = mins <= 60 && mins >= -15; // within next 60 minutes or started 15 min ago

          return (
            <motion.button
              key={a.id}
              layout
              onClick={() => setSelected(a)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
              className="text-left bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md focus:outline-none"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-medium">
                    <User className="w-4 h-4 text-slate-600" /> {a.patientName}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 truncate">{a.reason}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isNow ? (
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 block" /> Now
                      </span>
                    ) : (
                      <div className="text-sm font-semibold">{timeAgoOrTime(a.date)}</div>
                    )}
                  </div>
                  <div className="text-xs mt-1 text-slate-400">{new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Pill className="w-3 h-3" /> <span>{a.meds?.length ?? 0} meds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> <span>{a.previousVisits?.length ?? 0} prev</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "scheduled" ? "bg-emerald-100 text-emerald-700" : a.status === "completed" ? "bg-slate-100 text-slate-700" : "bg-rose-100 text-rose-700"}`}>
                    {a.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Future appointments */}
      {future.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-medium">Future appointments</h3>
          <p className="text-xs text-slate-500 mt-1">Beyond 7 days</p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {future.map((a) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{a.patientName}</h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">{a.reason}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{formatDate(a.date)}</div>
                    <div className="mt-1">{new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past appointments */}
      {past.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-medium">Past appointments</h3>
          <p className="text-xs text-slate-500 mt-1">Recent first</p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {past.map((a) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{a.patientName}</h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">{a.reason}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{formatDate(a.date)}</div>
                    <div className="mt-1">{new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: subtle backdrop so page does not go "dull" */}
      <AnimatePresence>
        {selected && (
          <motion.div key="modal-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center md:items-center justify-center pointer-events-none">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="pointer-events-auto bg-white w-full md:w-3/5 lg:w-2/5 rounded-t-2xl md:rounded-2xl shadow-2xl p-5 mx-3 md:mx-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> {selected.patientName}</h3>
                  <p className="text-sm text-slate-500">{selected.age ? `${selected.age} yrs` : "Age N/A"}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close details" className="p-2 rounded-md hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>{formatDate(selected.date)}</span></div>
                  <div className="text-sm text-slate-600 flex items-center gap-2"><Clock className="w-4 h-4" /> <span>{new Date(selected.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>

                  <div className="pt-2"><h4 className="text-sm font-medium">Reason</h4><p className="text-sm text-slate-500 mt-1">{selected.reason ?? "—"}</p></div>

                  <div className="pt-2"><h4 className="text-sm font-medium">Notes</h4><p className="text-sm text-slate-500 mt-1">{selected.notes ?? "No notes available."}</p></div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Previous visits</h4>
                    {selected.previousVisits && selected.previousVisits.length > 0 ? (
                      <ul className="mt-2 text-sm text-slate-500 space-y-2">
                        {selected.previousVisits.map((v, i) => (
                          <li key={i} className="rounded-lg p-2 bg-slate-50 border"><div className="text-xs font-medium">{v.date}</div><div className="text-xs mt-1">{v.notes ?? "—"}</div></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 mt-2">No previous visits found.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2"><Pill className="w-4 h-4" /> Medications</h4>
                    {selected.meds && selected.meds.length > 0 ? (
                      <ul className="mt-2 text-sm text-slate-500 space-y-1">
                        {selected.meds.map((m, i) => (
                          <li key={i} className="inline-block px-2 py-1 rounded-full bg-slate-100 text-xs">{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 mt-2">No medication recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => alert("Open patient history (replace alert with route/modal)")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-white text-sm"><Info className="w-4 h-4" /> History</button>
                <button onClick={() => alert("Open quick prescribe (replace alert with real action)")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm"><Heart className="w-4 h-4" /> Prescribe</button>
              </div> */}
            </motion.div>

            {/* subtle backdrop (transparent) so page won't look dull; clicking anywhere outside modal closes it */}
            <div onClick={() => setSelected(null)} className="fixed inset-0 z-40" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
