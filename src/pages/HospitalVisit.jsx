import { useState } from 'react'
import { Plus, Building2, Loader2, FileDown, Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'

const emptyForm = { hospital_name: '', admission_date: '', discharge_date: '', reason: '', diagnosis: '', treatment_summary: '' }

export default function HospitalVisit() {
  const { user } = useAuth()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [rowSaving, setRowSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('hospital_visits').insert({ ...form, user_id: user.id })
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      event_year: new Date(form.admission_date || Date.now()).getFullYear(),
      title: `Hospital Admission — ${form.hospital_name}`,
      category: 'hospital',
      description: form.reason || form.diagnosis || null,
    })
    setSaving(false)
    setForm(emptyForm)
    setShowForm(false)
    p.reload()
  }

  function startEdit(v) {
    setEditingId(v.id)
    setEditForm({
      hospital_name: v.hospital_name || '',
      admission_date: v.admission_date || '',
      discharge_date: v.discharge_date || '',
      reason: v.reason || '',
      diagnosis: v.diagnosis || '',
      treatment_summary: v.treatment_summary || '',
    })
  }

  async function saveEdit(id) {
    setRowSaving(true)
    await supabase.from('hospital_visits').update({
      hospital_name: editForm.hospital_name,
      admission_date: editForm.admission_date || null,
      discharge_date: editForm.discharge_date || null,
      reason: editForm.reason || null,
      diagnosis: editForm.diagnosis || null,
      treatment_summary: editForm.treatment_summary || null,
    }).eq('id', id)
    setRowSaving(false)
    setEditingId(null)
    await p.reload()
  }

  async function deleteVisit(v) {
    if (!window.confirm(`Delete this hospital admission record for "${v.hospital_name}"? This cannot be undone.`)) return
    await supabase.from('hospital_visits').delete().eq('id', v.id)
    await p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> Loading hospital records…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Hospital Visit</h1>
          <p className="mt-2 text-slate-500">Admissions, treatments and discharge records.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> Add Admission
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <input required placeholder="Hospital name" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <label className="flex flex-col gap-1 text-xs text-slate-400">Admission date
            <input type="date" value={form.admission_date} onChange={(e) => setForm({ ...form, admission_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-900" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">Discharge date
            <input type="date" value={form.discharge_date} onChange={(e) => setForm({ ...form, discharge_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-900" />
          </label>
          <input placeholder="Reason for admission" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <input placeholder="Primary diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <textarea placeholder="Treatment summary" value={form.treatment_summary} onChange={(e) => setForm({ ...form, treatment_summary: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" rows={3} />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? 'Saving…' : 'Save admission'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {p.hospitalVisits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            No hospital admissions recorded yet.
          </div>
        ) : (
          p.hospitalVisits.map((v) =>
            editingId === v.id ? (
              <form
                key={v.id}
                onSubmit={(e) => { e.preventDefault(); saveEdit(v.id) }}
                className="border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
              >
                <input required placeholder="Hospital name" value={editForm.hospital_name} onChange={(e) => setEditForm({ ...editForm, hospital_name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <label className="flex flex-col gap-1 text-xs text-slate-400">Admission date
                  <input type="date" value={editForm.admission_date} onChange={(e) => setEditForm({ ...editForm, admission_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-900" />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-400">Discharge date
                  <input type="date" value={editForm.discharge_date} onChange={(e) => setEditForm({ ...editForm, discharge_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink-900" />
                </label>
                <input placeholder="Reason for admission" value={editForm.reason} onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <input placeholder="Primary diagnosis" value={editForm.diagnosis} onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <textarea placeholder="Treatment summary" value={editForm.treatment_summary} onChange={(e) => setEditForm({ ...editForm, treatment_summary: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" rows={3} />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={rowSaving} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
                    <Check size={16} /> Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 text-slate-500 font-medium px-5 py-2.5">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div key={v.id} className="border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-bold text-ink-900 flex items-center gap-2">
                    <Building2 size={16} className="text-brand-600" /> {v.hospital_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEdit(v)} className="p-1 text-slate-400 hover:text-brand-600" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => deleteVisit(v)} className="p-1 text-slate-400 hover:text-red-600" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Admitted {v.admission_date ? new Date(v.admission_date).toLocaleDateString() : '—'} · Discharged{' '}
                  {v.discharge_date ? new Date(v.discharge_date).toLocaleDateString() : '—'}
                </p>
                <p className="mt-2 text-sm text-ink-900"><span className="text-slate-500">Reason for admission: </span>{v.reason}</p>
                <p className="text-sm text-ink-900"><span className="text-slate-500">Primary diagnosis: </span>{v.diagnosis}</p>

                <button onClick={() => setExpanded(expanded === v.id ? null : v.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  <FileDown size={14} /> {expanded === v.id ? 'Hide' : 'View'} Treatment Details
                </button>
                {expanded === v.id && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-ink-900 mb-1">Treatment Summary</p>
                    <p>{v.treatment_summary || 'Not documented for this admission.'}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      This reflects only what was entered for this admission — MediLink does not
                      generate clinical documentation automatically.
                    </p>
                  </div>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
