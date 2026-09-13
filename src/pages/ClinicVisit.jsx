import { useState } from 'react'
import { Plus, Stethoscope, Loader2, Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'
import { useLanguage } from '../context/LanguageContext'

const emptyForm = { visit_date: '', doctor: '', specialty: '', complaint: '', diagnosis: '', prescription: '', follow_up: '' }

export default function ClinicVisit() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [rowSaving, setRowSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    const visit_date = form.visit_date || new Date().toISOString().slice(0, 10)
    await supabase.from('clinic_visits').insert({
      ...form,
      visit_date,
      user_id: user.id,
    })
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      event_year: new Date(visit_date).getFullYear(),
      title: `Clinic Visit — ${form.diagnosis || form.complaint || form.specialty || 'Consultation'}`,
      category: 'clinic',
      description: [form.doctor && `Dr. ${form.doctor}`, form.specialty].filter(Boolean).join(' · ') || null,
    })
    setSaving(false)
    setForm(emptyForm)
    setShowForm(false)
    p.reload()
  }

  function startEdit(v) {
    setEditingId(v.id)
    setEditForm({
      visit_date: v.visit_date || '',
      doctor: v.doctor || '',
      specialty: v.specialty || '',
      complaint: v.complaint || '',
      diagnosis: v.diagnosis || '',
      prescription: v.prescription || '',
      follow_up: v.follow_up || '',
    })
  }

  async function saveEdit(id) {
    setRowSaving(true)
    await supabase.from('clinic_visits').update({
      visit_date: editForm.visit_date || new Date().toISOString().slice(0, 10),
      doctor: editForm.doctor,
      specialty: editForm.specialty || null,
      complaint: editForm.complaint || null,
      diagnosis: editForm.diagnosis || null,
      prescription: editForm.prescription || null,
      follow_up: editForm.follow_up || null,
    }).eq('id', id)
    setRowSaving(false)
    setEditingId(null)
    await p.reload()
  }

  async function deleteVisit(v) {
    if (!window.confirm('Delete this clinic visit record? This cannot be undone.')) return
    await supabase.from('clinic_visits').delete().eq('id', v.id)
    await p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> {t('Loading clinic visits…')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">{t('Clinic Visit')}</h1>
          <p className="mt-2 text-slate-500">{t('Consultations, diagnoses and treatment records.')}</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> {t('Add New Visit')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required placeholder={t('Doctor')} value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder={t('Speciality')} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder={t('Chief complaint')} value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder={t('Diagnosis')} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <textarea placeholder={t('Prescription')} value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" rows={2} />
          <input placeholder={t('Follow-up')} value={form.follow_up} onChange={(e) => setForm({ ...form, follow_up: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? t('Saving…') : t('Save visit')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">{t('Cancel')}</button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {p.clinicVisits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            {t('No clinic visits recorded yet.')}
          </div>
        ) : (
          p.clinicVisits.map((v) =>
            editingId === v.id ? (
              <form
                key={v.id}
                onSubmit={(e) => { e.preventDefault(); saveEdit(v.id) }}
                className="border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
              >
                <input type="date" value={editForm.visit_date} onChange={(e) => setEditForm({ ...editForm, visit_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input required placeholder={t('Doctor')} value={editForm.doctor} onChange={(e) => setEditForm({ ...editForm, doctor: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input placeholder={t('Speciality')} value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input placeholder={t('Chief complaint')} value={editForm.complaint} onChange={(e) => setEditForm({ ...editForm, complaint: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input placeholder={t('Diagnosis')} value={editForm.diagnosis} onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <textarea placeholder={t('Prescription')} value={editForm.prescription} onChange={(e) => setEditForm({ ...editForm, prescription: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" rows={2} />
                <input placeholder={t('Follow-up')} value={editForm.follow_up} onChange={(e) => setEditForm({ ...editForm, follow_up: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={rowSaving} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
                    <Check size={16} /> {t('Save')}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 text-slate-500 font-medium px-5 py-2.5">
                    <X size={16} /> {t('Cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div key={v.id} className="border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-ink-900 flex items-center gap-2">
                    <Stethoscope size={16} className="text-brand-600" /> {new Date(v.visit_date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{v.specialty}</span>
                    <button type="button" onClick={() => startEdit(v)} className="p-1 text-slate-400 hover:text-brand-600" title={t('Edit')}>
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => deleteVisit(v)} className="p-1 text-slate-400 hover:text-red-600" title={t('Delete')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">{t('Doctor')}: <span className="text-ink-900 font-medium">{v.doctor}</span></p>
                <p className="text-sm text-slate-500">{t('Chief complaint')}: <span className="text-ink-900">{v.complaint}</span></p>
                <p className="text-sm text-slate-500">{t('Diagnosis')}: <span className="text-ink-900 font-medium">{v.diagnosis}</span></p>
                {v.prescription && <p className="text-sm text-slate-500 mt-2">{t('Prescription')}: <span className="text-ink-900">{v.prescription}</span></p>}
                {v.follow_up && <p className="text-sm text-slate-400 mt-1">{t('Follow-up')}: {v.follow_up}</p>}
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
