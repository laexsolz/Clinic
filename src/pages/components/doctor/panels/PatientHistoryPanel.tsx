import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, FileText, Download, Eye, X } from "lucide-react";
import { jsPDF } from "jspdf";

// Patients History Panel (mobile-responsive improvements)
// - fixes overflowing date/report counts on small screens
// - ensures buttons wrap/stack on mobile and look tidy
// - adds min-w-0 and truncate where needed
// - keeps framer-motion + jsPDF functionality from before

type Report = {
  id: string;
  title: string;
  date: string; // ISO
  note?: string;
};

type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  lastVisit?: string; // ISO
  summary?: string;
  reports?: Report[];
};

const samplePatients: Patient[] = [
  {
    id: "P-1001",
    name: "Sarah Connor",
    age: 29,
    gender: "F",
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    summary: "Hypertension follow-up; on Amlodipine 5mg.",
    reports: [
      { id: "r1", title: "BP Report", date: "2025-09-11", note: "Stable" },
    ],
  },
  {
    id: "P-1002",
    name: "Liam Walker",
    age: 42,
    gender: "M",
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    summary: "Chest pain evaluation; referred from ER.",
    reports: [
      { id: "r2", title: "ECG Report", date: "2025-08-03", note: "Normal" },
    ],
  },
  {
    id: "P-1003",
    name: "Jessica Martin",
    age: 41,
    gender: "F",
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    summary: "ENT follow-up for sinus issues.",
    reports: [
      { id: "r3", title: "Sinus CT", date: "2025-06-09", note: "Mucosal thickening" },
    ],
  },
  {
    id: "P-1004",
    name: "Carlos Mendez",
    age: 38,
    gender: "M",
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    summary: "Cholesterol follow-up; on Rosuvastatin.",
    reports: [
      { id: "r4", title: "Lipid Panel", date: "2025-06-12", note: "Improved" },
    ],
  },
  {
    id: "P-1005",
    name: "Emily Brown",
    age: 31,
    gender: "F",
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    summary: "Anxiety follow-up; on Sertraline.",
    reports: [
      { id: "r5", title: "Psych Eval", date: "2025-09-15", note: "Responding well" },
    ],
  },
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function generateSamplePdf(patient: Patient, report: Report) {
  // create a simple PDF using jsPDF and return blob URL
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  doc.setFontSize(14);
  doc.text(`Patient Report`, margin, 60);
  doc.setFontSize(11);
  doc.text(`Patient: ${patient.name} (${patient.id})`, margin, 90);
  doc.text(`Report: ${report.title}`, margin, 110);
  doc.text(`Date: ${report.date}`, margin, 130);
  doc.setFontSize(10);
  doc.text(`Note: ${report.note ?? "-"}`, margin, 160);
  doc.text(`Summary: ${patient.summary ?? "-"}`, margin, 190);

  // add a fake table or values
  doc.setFontSize(9);
  doc.text(`--- Sample values ---`, margin, 230);
  doc.text(`Systolic: 120 mmHg`, margin, 250);
  doc.text(`Diastolic: 78 mmHg`, margin, 270);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { url, blob };
}

export default function PatientsHistoryPanel() {
  const [query, setQuery] = useState("");
  const [patients] = useState<Patient[]>(samplePatients);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [patients, query]);

  async function handlePreview(patient: Patient, report: Report) {
    const { url } = await generateSamplePdf(patient, report);
    setPreviewUrl(url);
  }

  async function handleDownload(patient: Patient, report: Report) {
    setDownloading(report.id);
    const { blob } = await generateSamplePdf(patient, report);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${patient.id}-${report.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setDownloading(null), 600);
  }

  return (
    <div className="w-full p-3">
      {/* search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients by name or ID"
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
        <button
          onClick={() => setQuery("")}
          className="px-3 py-2 rounded-xl border bg-white text-sm shadow-sm"
        >
          Clear
        </button>
      </div>

      {/* cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => setSelected(p)}
            layout
            whileHover={{ scale: 1.02 }}
            className="text-left bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 hover:shadow-md focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{/* min-w-0 + truncate to prevent overflow */}
                <h3 className="text-md font-medium flex items-center gap-2 truncate">
                  <User className="w-4 h-4" />
                  <span className="truncate">{p.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 truncate">{p.id} • {p.age ? `${p.age} yrs` : "Age N/A"}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2 truncate">{p.summary}</p>
              </div>

              <div className="flex-shrink-0 text-right text-xs text-slate-400 w-28 sm:w-32">
                <div className="truncate">{formatDate(p.lastVisit)}</div>
                <div className="mt-3 inline-flex items-center gap-2 justify-end">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs truncate">{p.reports?.length ?? 0} reports</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected patient modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> {selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.id} • {selected.age ? `${selected.age} yrs` : "Age N/A"}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Summary</h4>
                    <p className="text-sm text-slate-600">{selected.summary ?? "No summary available."}</p>

                    <h4 className="text-sm font-medium pt-4">Last visit</h4>
                    <p className="text-sm text-slate-600">{formatDate(selected.lastVisit)}</p>

                    <div className="pt-4">
                      <h4 className="text-sm font-medium">Demographics</h4>
                      <p className="text-sm text-slate-600">{selected.gender ?? "-"} • {selected.age ? `${selected.age} yrs` : "-"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Reports</h4>

                    {selected.reports && selected.reports.length > 0 ? (
                      <ul className="space-y-3">
                        {selected.reports.map((r) => (
                          <li key={r.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border rounded-lg p-3 bg-slate-50 gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{r.title}</div>
                              <div className="text-xs text-slate-500">{formatDate(r.date)}</div>
                            </div>

                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-2 gap-2">
                              <button onClick={() => handlePreview(selected, r)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border text-sm w-full sm:w-auto">
                                <Eye className="w-4 h-4" /> Preview
                              </button>
                              <button onClick={() => handleDownload(selected, r)} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm w-full sm:w-auto">
                                {downloading === r.id ? "Downloading..." : (<><Download className="w-4 h-4" /> Download</>)}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No reports available.</p>
                    )}
                  </div>
                </div>

                {/* preview area */}
                <AnimatePresence>
                  {previewUrl && (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Report preview</h4>
                        <button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} className="text-sm text-slate-500 underline">Close preview</button>
                      </div>

                      <div className="border rounded-lg overflow-hidden" style={{ height: 400 }}>
                        <iframe src={previewUrl} title="report-preview" className="w-full h-full" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border bg-white">Close</button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
