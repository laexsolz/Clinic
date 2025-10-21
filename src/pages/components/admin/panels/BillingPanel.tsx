import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Eye, Plus, Trash2 } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface LineItem {
  id: number
  description: string
  qty: number
  unit: number
}

interface Invoice {
  id: number
  patientName: string
  date: string // ISO
  invoiceNo: string
  items: LineItem[]
  paid: boolean
}

export default function BillingPanel() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      patientName: 'John Doe',
      date: '2025-10-10',
      invoiceNo: 'INV-1001',
      paid: false,
      items: [
        { id: 1, description: 'Consultation (30 mins)', qty: 1, unit: 1500 },
        { id: 2, description: 'ECG', qty: 1, unit: 800 },
        { id: 3, description: 'Blood test (CBC)', qty: 1, unit: 600 },
      ],
    },
    {
      id: 2,
      patientName: 'Ayesha Raza',
      date: '2025-09-20',
      invoiceNo: 'INV-1002',
      paid: true,
      items: [
        { id: 1, description: 'Dermatology consult', qty: 1, unit: 1200 },
        { id: 2, description: 'Topical medication', qty: 1, unit: 400 },
      ],
    },
  ])

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<{ patientName: string; date: string; invoiceNo: string; items: LineItem[] }>({
    patientName: '',
    date: new Date().toISOString().slice(0, 10),
    invoiceNo: '',
    items: [{ id: 1, description: '', qty: 1, unit: 0 }],
  })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = invoices.filter((inv) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return inv.patientName.toLowerCase().includes(q) || inv.invoiceNo.toLowerCase().includes(q)
  })

  const totalFor = (inv: Invoice) => inv.items.reduce((s, it) => s + it.qty * it.unit, 0)

  const downloadPDF = (inv: Invoice) => {
    // Use jsPDF to generate and trigger a direct PDF download (no new window)
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40
    let y = 40

    doc.setFontSize(18)
    doc.text(`Invoice — ${inv.invoiceNo}`, margin, y)
    y += 24

    doc.setFontSize(11)
    doc.text(`Patient: ${inv.patientName}`, margin, y)
    doc.text(`Date: ${inv.date}`, 450, y)
    y += 18

    doc.setDrawColor(230)
    doc.setLineWidth(0.5)
    doc.line(margin, y, 555, y)
    y += 12

    // table header
    doc.setFontSize(10)
    doc.text('Description', margin, y)
    doc.text('Qty', 360, y)
    doc.text('Unit (PKR)', 410, y)
    doc.text('Amount (PKR)', 500, y)
    y += 10
    doc.line(margin, y, 555, y)
    y += 14

    inv.items.forEach((it) => {
      const amount = it.qty * it.unit
      // wrap description if too long
      const lines = doc.splitTextToSize(it.description, 320)
      doc.text(lines, margin, y)
      doc.text(String(it.qty), 360, y)
      doc.text(String(it.unit), 420, y)
      doc.text(String(amount), 500, y)
      y += 14 * lines.length
      y += 6
      if (y > 720) {
        doc.addPage()
        y = 40
      }
    })

    doc.setLineWidth(0.5)
    doc.line(360, y, 555, y)
    y += 10
    doc.setFontSize(12)
    doc.text('Total', 410, y)
    doc.text(String(totalFor(inv)), 500, y)

    doc.save(`${inv.invoiceNo}.pdf`)
  }

  const openPrint = (inv: Invoice) => {
    // keep view/print behavior using print dialog (non-blocking)
    const html = `
      <html>
      <head>
        <title>${inv.invoiceNo}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:20px}
          .wrap{max-width:720px;margin:0 auto}
          h1{font-size:20px;margin-bottom:6px}
          .meta{color:#475569;font-size:13px;margin-bottom:16px}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          th,td{padding:8px;border-bottom:1px solid #e6e7eb;text-align:left}
          tfoot td{font-weight:700}
          @media print { button{display:none} }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>Invoice — ${inv.invoiceNo}</h1>
          <div class="meta">Patient: ${inv.patientName} • Date: ${inv.date}</div>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead>
            <tbody>
              ${inv.items
                .map((it) => `<tr><td>${it.description}</td><td>${it.qty}</td><td>PKR ${it.unit}</td><td>PKR ${it.qty * it.unit}</td></tr>`)
                .join('')}
            </tbody>
            <tfoot>
              <tr><td></td><td></td><td>Total</td><td>PKR ${totalFor(inv)}</td></tr>
            </tfoot>
          </table>
          <div style="margin-top:18px">This is a demo invoice from Admin Portal Demo.</div>
          <div style="margin-top:14px"><button onclick="window.print()">Print / Save as PDF</button></div>
        </div>
      </body>
      </html>
    `

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ patientName: '', date: new Date().toISOString().slice(0, 10), invoiceNo: `INV-${Math.floor(Math.random() * 9000) + 1000}`, items: [{ id: 1, description: '', qty: 1, unit: 0 }] })
    setCreateOpen(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditingId(inv.id)
    setForm({ patientName: inv.patientName, date: inv.date, invoiceNo: inv.invoiceNo, items: inv.items.map((i) => ({ ...i })) })
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setTimeout(() => {
      setForm({ patientName: '', date: new Date().toISOString().slice(0, 10), invoiceNo: '', items: [{ id: 1, description: '', qty: 1, unit: 0 }] })
      setEditingId(null)
    }, 200)
  }

  const handleFormChange = (field: keyof typeof form, value: string | number) => {
    setForm((s) => ({ ...s, [field]: value } as any))
  }

  const handleItemChange = (index: number, key: keyof LineItem, value: string | number) => {
    setForm((s) => {
      const items = [...s.items]
      items[index] = { ...items[index], [key]: value }
      return { ...s, items }
    })
  }

  const addItem = () => setForm((s) => ({ ...s, items: [...s.items, { id: Date.now(), description: '', qty: 1, unit: 0 }] }))
  const removeItem = (idx: number) => setForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }))

  const saveInvoice = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.patientName || !form.invoiceNo) return
    if (editingId) {
      setInvoices((list) => list.map((inv) => (inv.id === editingId ? { ...inv, ...form } as Invoice : inv)))
    } else {
      const id = invoices.length ? Math.max(...invoices.map((i) => i.id)) + 1 : 1
      setInvoices((list) => [...list, { id, patientName: form.patientName, date: form.date, invoiceNo: form.invoiceNo, paid: false, items: form.items }])
    }
    closeCreate()
  }

  const requestDelete = (id: number) => setDeleteId(id)
  const cancelDelete = () => setDeleteId(null)
  const confirmDelete = () => {
    if (deleteId !== null) setInvoices((list) => list.filter((i) => i.id !== deleteId))
    setDeleteId(null)
    if (selected?.id === deleteId) setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Billing</h2>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by patient or invoice #" className="px-3 py-2 rounded-md border border-slate-200 text-sm w-56 max-w-xs" />
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create bill</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
            <div className="text-sm text-slate-600 mb-2">Invoices</div>
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {filtered.map((inv) => (
                <motion.button key={inv.id} onClick={() => setSelected(inv)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }} className={`w-full text-left p-3 rounded-md border ${selected?.id === inv.id ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{inv.patientName}</div>
                      <div className="text-xs text-slate-500">{inv.invoiceNo} • {inv.date}</div>
                    </div>
                    <div className="text-sm font-medium">PKR {totalFor(inv)}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 line-clamp-2">{inv.items.map((i) => i.description).slice(0, 2).join(', ')}</div>
                </motion.button>
              ))}
              {filtered.length === 0 && <div className="text-sm text-slate-500 p-3">No invoices found.</div>}
            </div>
          </div>
        </div>

        {/* Detail (no animation) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 min-h-[200px]">
            {selected ? (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold">Invoice — {selected.invoiceNo}</div>
                    <div className="text-sm text-slate-500">{selected.patientName} • {selected.date}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => openPrint(selected)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border">
                      <Eye className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
                    </button>
                    <button onClick={() => downloadPDF(selected)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white">
                      <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    <button onClick={() => openEdit(selected)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border">
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button onClick={() => requestDelete(selected.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 border">
                      <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 overflow-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="py-2">Description</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Unit</th>
                        <th className="py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="py-3 align-top">{it.description}</td>
                          <td className="py-3 align-top">{it.qty}</td>
                          <td className="py-3 align-top">PKR {it.unit}</td>
                          <td className="py-3 align-top">PKR {it.qty * it.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={2}></td>
                        <td className="py-3 font-medium">Total</td>
                        <td className="py-3 font-medium">PKR {totalFor(selected)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">Select an invoice to view details.</div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-sm text-slate-500">Showing {filtered.length} invoices</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm rounded-md border bg-slate-50">Export CSV</button>
              <button onClick={() => setInvoices((list) => list.map((i) => ({ ...i, paid: true })))} className="px-3 py-2 text-sm rounded-md border bg-slate-50">Mark all paid</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/40" onClick={closeCreate} />
            <motion.form onSubmit={saveInvoice} className="relative z-10 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200" initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h3>
                <button type="button" onClick={closeCreate} className="text-slate-500">Close</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={form.patientName} onChange={(e) => handleFormChange('patientName', e.target.value)} placeholder="Patient name" className="col-span-2 px-3 py-2 rounded-md border border-slate-200" />
                <input value={form.invoiceNo} onChange={(e) => handleFormChange('invoiceNo', e.target.value)} placeholder="Invoice no" className="px-3 py-2 rounded-md border border-slate-200" />
                <input type="date" value={form.date} onChange={(e) => handleFormChange('date', e.target.value)} className="px-3 py-2 rounded-md border border-slate-200" />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Items</div>
                  <button type="button" onClick={addItem} className="text-sm px-2 py-1 rounded-md border bg-slate-50">Add item</button>
                </div>

                <div className="space-y-2">
                  {form.items.map((it, i) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <label className="text-xs text-slate-500 block mb-1">Description</label>
                        <input value={it.description} onChange={(e) => handleItemChange(i, 'description', e.target.value)} placeholder="Description" className="w-full px-2 py-2 rounded-md border" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">Qty</label>
                        <input type="number" value={it.qty} onChange={(e) => handleItemChange(i, 'qty', Number(e.target.value))} className="w-full px-2 py-2 rounded-md border" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-slate-500 block mb-1">Price (PKR)</label>
                        <input type="number" value={it.unit} onChange={(e) => handleItemChange(i, 'unit', Number(e.target.value))} className="w-full px-2 py-2 rounded-md border" />
                      </div>
                      <div className="col-span-1 text-right">
                        <label className="text-xs text-slate-500 block mb-1 invisible">Remove</label>
                        <button type="button" onClick={() => removeItem(i)} className="sm:px-2 sm:py-2 px-1 py-1 rounded-md border bg-red-50 text-red-700"><Trash2 className='w-6 h-6'/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button type="button" onClick={closeCreate} className="w-full sm:w-auto px-3 py-2 rounded-md border">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white">{editingId ? 'Save changes' : 'Create invoice'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div className="fixed inset-0 z-60 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelDelete} />
            <motion.div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6" initial={{ scale: 0.98, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 6 }}>
              <div className="flex items-start gap-3">
                <div className="bg-red-50 p-2 rounded-md">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete invoice?</h3>
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
    </div>
  )
}
